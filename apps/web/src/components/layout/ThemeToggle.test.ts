import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeToggle } from './ThemeToggle.tsx';

function renderThemeToggle(): string {
  return renderToStaticMarkup(
    createElement(
      TooltipProvider,
      null,
      createElement(ThemeToggle),
    ),
  );
}

test('ThemeToggle renders a button wrapped in a tooltip with proper accessibility labels', () => {
  const html = renderThemeToggle();

  // Verify button with aria-label exists
  assert.match(html, /aria-label="Switch to (?:light|dark) theme"/, 'ThemeToggle button has accessible aria-label');

  // Verify decorative icons are hidden from screen readers
  assert.match(html, /aria-hidden="true"/, 'ThemeToggle icon is marked aria-hidden="true"');

  // Verify Radix Tooltip trigger data attribute or content presence
  assert.match(html, /data-slot="tooltip-trigger"/, 'ThemeToggle button acts as a tooltip trigger');
  assert.match(html, /Switch to (?:light|dark) theme/, 'Tooltip includes theme toggle label text');
});
