import { chromium, type Page } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const viewports = [
  ...[320, 375, 414, 768, 1024, 1280, 1440, 1920, 2560].map((width) => ({ name: `${width}`, width, height: 960 })),
  { name: 'landscape-844x390', width: 844, height: 390 },
];
const routes = ['/', '/connect'];
const phase = process.env.QA_PHASE === 'before' ? 'before' : 'after';
const outputDir = resolve(process.env.QA_OUTPUT ?? `.qa/ui-cleanup/${phase}`);
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
  for (const { name, width, height } of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
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

    const navStarted = Date.now();
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(outputDir, `${route === '/' ? 'home' : 'connect'}-${name}.png`), fullPage: true });
    if (phase === 'before') {
      await page.close();
      continue;
    }

    const result = await inspect(page, width);
    if (result.horizontalOverflow) report(route, width, `document width ${result.scrollWidth}px exceeds viewport`);
    if (result.brokenIcons.length) report(route, width, `icon SVGs are not visible: ${result.brokenIcons.join(', ')}`);
    if (result.overlappingSiblings.length) report(route, width, `overlapping text siblings: ${result.overlappingSiblings.slice(0, 4).join('; ')}`);
    if (result.unevenRows.length) report(route, width, `unequal card heights: ${result.unevenRows.join('; ')}`);
    if (result.smallTargets.length) report(route, width, `tap targets below 44px: ${result.smallTargets.slice(0, 6).join(', ')}`);
    if (route === '/' && name === '1280') {
      const perf = await page.evaluate(() => {
        const cards = [...document.querySelectorAll<HTMLElement>('.app-card')];
        const layoutStarted = performance.now();
        const totalCardHeight = cards.reduce((sum, card) => sum + card.getBoundingClientRect().height, 0);
        return { count: cards.length, layoutMs: Math.round((performance.now() - layoutStarted) * 100) / 100, totalCardHeight };
      });
      console.log(`Performance sample: ${perf.count} catalog cards; geometry read ${perf.layoutMs}ms; total stacked height ${Math.round(perf.totalCardHeight)}px; page ready in ${Date.now() - navStarted}ms`);
      if (perf.count !== 160) report(route, width, `expected 160 catalog cards, found ${perf.count}`);
    }
    if (route === '/' && name === '1440') {
      const logos = await page.evaluate(async () => {
        const images = [...document.querySelectorAll<HTMLImageElement>('.app-card img')];
        for (let top = 0; top < document.documentElement.scrollHeight; top += innerHeight) {
          window.scrollTo(0, top);
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
        return {
          total: images.length,
          broken: images.filter((image) => !image.naturalWidth || !image.naturalHeight).map((image) => image.alt),
          missingAlt: images.filter((image) => !image.alt.trim()).length,
          distorted: images.filter((image) => getComputedStyle(image).objectFit !== 'contain').map((image) => image.alt),
          fallbacks: document.querySelectorAll('.app-card .brand-logo-fallback').length,
        };
      });
      console.log(`Logo check: ${logos.total} local logos, ${logos.fallbacks} initials fallbacks; ${logos.broken.length} broken, ${logos.distorted.length} distorted`);
      if (logos.broken.length) report(route, width, `broken logos: ${logos.broken.slice(0, 6).join(', ')}`);
      if (logos.missingAlt) report(route, width, `${logos.missingAlt} logos lack alt text`);
      if (logos.distorted.length) report(route, width, `non-square logo sources: ${logos.distorted.slice(0, 6).join(', ')}`);
      const tagCounts = await page.evaluate(() => [...document.querySelectorAll('.role-card__tags')].map((group) => group.children.length));
      if (tagCounts.some((count) => count > 3)) report(route, width, 'preset has more than three tags');
    }
    if (route === '/' && width < 768) {
      await testMobileMenu(page, report, width);
    }
    if (route === '/' && width >= 768) {
      const navFits = await page.evaluate(() => {
        const links = [...document.querySelectorAll<HTMLElement>('.site-nav__link')];
        const rects = links.map((link) => ({ rect: link.getBoundingClientRect() }));
        return rects.length === 5 && rects.every(({ rect }) => rect.width > 0 && rect.height <= 48 && rect.left >= 0 && rect.right <= innerWidth);
      });
      if (!navFits) report(route, width, 'navigation links are hidden, wrapped, or outside the viewport');
    }
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

    console.log(`${phase}: ${route} @ ${name} (${width}x${height})${issues.some((issue) => issue.startsWith(`${route} @ ${width}px`)) ? ' — issues' : ' — OK'}`);
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
if (phase === 'before') console.log(`\nCaptured baseline screenshots in ${outputDir}; no post-redesign checks ran.`);
else console.log(`\nAll ${routes.length * viewports.length} route and viewport combinations passed.`);
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
      '[role="radiogroup"] > .distro-card',
      '.role-grid > button',
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

    const icons = Array.from(document.querySelectorAll('svg')).filter(visible);
    const brokenIcons = icons.filter((icon) => icon.getBoundingClientRect().width === 0 || icon.getBoundingClientRect().height === 0).map((icon) => icon.getAttribute('class') ?? 'svg').slice(0, 8);
    const smallTargets = Array.from(document.querySelectorAll('button, a, [role="button"], [role="radio"]'))
      .filter(visible)
      .filter((element) => element.getBoundingClientRect().height < 44)
      .map((element) => element.tagName.toLowerCase() + '.' + String(element.className).split(' ').slice(0, 2).join('.') + ':' + Math.round(element.getBoundingClientRect().height) + 'px')
      .slice(0, 20);

    return {
      scrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > width,
      brokenIcons,
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

async function testMobileMenu(page: Page, reportIssue: typeof report, width: number) {
  const menuButton = page.locator('.site-menu-button');
  if (!(await menuButton.isVisible())) {
    reportIssue('/', width, 'mobile navigation trigger is not visible');
    return;
  }
  for (let index = 0; index < 8; index += 1) {
    const isMenu = await page.evaluate(() => document.activeElement?.classList.contains('site-menu-button') ?? false);
    if (isMenu) break;
    await page.keyboard.press('Tab');
  }
  const focusedMenu = await page.evaluate(() => document.activeElement?.classList.contains('site-menu-button') ?? false);
  if (!focusedMenu) {
    reportIssue('/', width, 'keyboard tab sequence did not reach the mobile menu');
    return;
  }
  await page.keyboard.press('Enter');
  const drawer = page.locator('#mobile-navigation');
  if (!(await drawer.isVisible())) {
    reportIssue('/', width, 'keyboard could not open the mobile navigation drawer');
    return;
  }
  const scrollLocked = await page.evaluate(() => document.body.style.overflow === 'hidden');
  if (!scrollLocked) reportIssue('/', width, 'body scrolling remains enabled while the drawer is open');
  await page.keyboard.press('Shift+Tab');
  const trapped = await page.evaluate(() => {
    const links = document.querySelectorAll<HTMLElement>('#mobile-navigation a, #mobile-navigation button');
    return links.length > 0 && document.activeElement === links[links.length - 1];
  });
  if (!trapped) reportIssue('/', width, 'Shift+Tab escaped the open navigation drawer');
  await page.keyboard.press('Escape');
  if (await drawer.isVisible()) reportIssue('/', width, 'Escape did not close the navigation drawer');
  const focusRestored = await page.evaluate(() => document.activeElement?.classList.contains('site-menu-button') ?? false);
  if (!focusRestored) reportIssue('/', width, 'closing the drawer did not return focus to its trigger');
}
