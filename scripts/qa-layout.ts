import { chromium, type Page } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const widths = [360, 768, 1024, 1440, 1920];
const routes = ['/', '/connect'];
const phase = process.env.QA_PHASE === 'before' ? 'before' : 'after';
const outputDir = resolve('.qa', phase);
const baseUrl = process.env.QA_BASE_URL ?? 'http://localhost:5173';
const issues: string[] = [];
const systemChrome = process.env.CHROME_BIN ?? ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(systemChrome ? { executablePath: systemChrome } : {}),
  args: ['--no-sandbox'],
});

function report(route: string, width: number, issue: string) {
  issues.push(`${route} @ ${width}px: ${issue}`);
}

for (const route of routes) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
    const consoleErrors: string[] = [];
    const failedFonts: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      if (/\.(woff2?|ttf)(\?|$)|fonts\.googleapis\.com/i.test(request.url())) {
        failedFonts.push(`${request.url()}: ${request.failure()?.errorText ?? 'request failed'}`);
      }
    });

    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(outputDir, `${route === '/' ? 'home' : 'connect'}-${width}.png`), fullPage: true });

    const result = await inspect(page, width);
    if (result.horizontalOverflow) report(route, width, `document width ${result.scrollWidth}px exceeds viewport`);
    if (!result.iconFontLoaded) report(route, width, 'Material Symbols Outlined font is not loaded');
    if (result.wideIcons.length) report(route, width, `icon boxes exceed 2em: ${result.wideIcons.join(', ')}`);
    if (result.overlappingSiblings.length) report(route, width, `overlapping text siblings: ${result.overlappingSiblings.slice(0, 4).join('; ')}`);
    if (result.unevenRows.length) report(route, width, `unequal card heights: ${result.unevenRows.join('; ')}`);
    if (width === 360 && result.smallTargets.length) report(route, width, `tap targets below 40px: ${result.smallTargets.slice(0, 6).join(', ')}`);
    for (const message of consoleErrors) report(route, width, `console error: ${message}`);
    for (const error of failedFonts) report(route, width, `font request failed: ${error}`);

    await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
    await page.waitForTimeout(100);
    const trayOverlap = await page.evaluate(`(() => {
      const main = document.querySelector('main');
      const tray = document.querySelector('.sticky.z-20');
      if (!main || !tray) return false;
      const mainRect = main.getBoundingClientRect();
      const trayRect = tray.getBoundingClientRect();
      return mainRect.bottom > trayRect.top + 1 && trayRect.bottom > mainRect.top + 1;
    })()`);
    if (trayOverlap) report(route, width, 'stepper tray overlaps main content at the page end');

    console.log(`${phase}: ${route} @ ${width}px${issues.some((issue) => issue.startsWith(`${route} @ ${width}px`)) ? ' — issues' : ' — OK'}`);
    await page.close();
  }
}

await browser.close();
const defectList = issues.length ? issues.map((issue) => `- ${issue}`).join('\n') : '- No reproducible layout defects.';
await BunlessWriteFile(resolve(outputDir, 'defects.md'), `# ${phase === 'before' ? 'Before' : 'After'} layout QA\n\n${defectList}\n`);
if (issues.length) {
  console.error(`\n${issues.length} layout QA issue(s):\n${defectList}`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${routes.length * widths.length} route and viewport combinations passed.`);
}

async function inspect(page: Page, viewportWidth: number) {
  const script = `(() => {
    const width = ${viewportWidth};
    const visible = function (element) {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
    };
    const overlaps = [];
    const textSiblings = function (parent) {
      const children = Array.from(parent.children).filter((child) => visible(child) && (child.textContent ?? '').trim());
      for (let left = 0; left < children.length; left += 1) {
        for (let right = left + 1; right < children.length; right += 1) {
          const a = children[left].getBoundingClientRect();
          const b = children[right].getBoundingClientRect();
          if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) {
            overlaps.push(parent.tagName.toLowerCase() + ': ' + children[left].textContent.trim().slice(0, 20) + ' / ' + children[right].textContent.trim().slice(0, 20));
          }
        }
      }
    };
    document.querySelectorAll('article, [role="radio"], [role="button"], header > div').forEach(textSiblings);

    const selectors = [
      '[role="radiogroup"] > [role="radio"]',
      'section[aria-labelledby="role-heading"] .grid > [role="button"]',
      '[aria-label="Application catalog"] > article',
    ];
    const unevenRows = [];
    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector)).filter(visible);
      const rows = new Map();
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        const key = Math.round(rect.top);
        rows.set(key, [...(rows.get(key) ?? []), Math.round(rect.height)]);
      }
      for (const [top, heights] of rows) {
        if (heights.length > 1 && Math.max(...heights) !== Math.min(...heights)) unevenRows.push(selector + ' row ' + top + 'px (' + heights.join('/') + ')');
      }
    }

    const icons = Array.from(document.querySelectorAll('.material-symbols-outlined')).filter(visible);
    const wideIcons = icons.filter(function (icon) {
      const style = getComputedStyle(icon);
      return icon.getBoundingClientRect().width > 2 * Number.parseFloat(style.fontSize);
    }).map((icon) => (icon.textContent ?? '').trim()).slice(0, 8);
    const smallTargets = Array.from(document.querySelectorAll('button, a, [role="button"], [role="radio"]'))
      .filter(visible)
      .filter((element) => element.getBoundingClientRect().height < 40)
      .map((element) => element.tagName.toLowerCase() + '.' + String(element.className).split(' ').slice(0, 2).join('.') + ':' + Math.round(element.getBoundingClientRect().height) + 'px')
      .slice(0, 20);

    return {
      scrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > width,
      iconFontLoaded: document.fonts.check('24px "Material Symbols Outlined"'),
      wideIcons,
      overlappingSiblings: overlaps,
      unevenRows,
      smallTargets,
    };
  })()`;
  return page.evaluate(script);
}

async function BunlessWriteFile(path: string, content: string) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path, content, 'utf8');
}
