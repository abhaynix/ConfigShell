/**
 * The connect page, rendered for real in every state it can be in.
 *
 * Same approach as `PlanView.test.ts`: React's server renderer produces the
 * actual markup on the `tsx --test` runner, so these assertions are about
 * output the component really made — no DOM runner, no new dependency. Click
 * behaviour (the copy button) is still untested, which is the standing gap in
 * `docs/testing.md`.
 *
 * What matters here is that the page cannot lie about the boundary. It is the
 * screen a user reads before handing this endpoint to an AI assistant, so the
 * URL it shows, the tools it lists and the capabilities it says are withheld
 * all have to come from the server rather than from copy written in the
 * component.
 */

import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { test } from 'node:test';
import { ApiRequestError, type McpConnection } from '@/lib/api';
import { ConnectPage } from './ConnectView.tsx';

function connection(overrides: Partial<McpConnection> = {}): McpConnection {
  return {
    url: 'https://configshell.example/mcp',
    path: '/mcp',
    transport: 'streamable-http',
    authentication: 'none',
    tools: [
      { name: 'list_environments', title: 'List supported environments', description: 'd' },
      { name: 'generate_setup', title: 'Generate setup plan', description: 'd' },
    ],
    withheld: [{ name: 'execute_setup', reason: 'No MCP tool may run a command.' }],
    executesCommands: false,
    ...overrides,
  };
}

function render(props: Partial<Parameters<typeof ConnectPage>[0]> = {}): string {
  return renderToStaticMarkup(
    createElement(ConnectPage, {
      connection: connection(),
      error: null,
      loading: false,
      onBack: () => {},
      ...props,
    }),
  );
}

test('the MCP URL is shown in full, exactly as the server derived it', () => {
  // Never truncated and never rebuilt from the browser's origin: this is the
  // string a user copies into an AI host, and a wrong one is a broken connector.
  const html = render();
  assert.match(html, /https:\/\/configshell\.example\/mcp/);
});

test('every tool the server reports is listed, by name', () => {
  const html = render();
  for (const tool of connection().tools) {
    assert.match(html, new RegExp(tool.name), `${tool.name} is missing from the page`);
    assert.match(html, new RegExp(tool.title));
  }
});

test('the page lists no tool the server did not report', () => {
  // The withheld capabilities must never appear as things the assistant gains.
  // They have their own section; what must not happen is the page inventing a
  // tool because someone hardcoded a list here.
  const html = render({ connection: connection({ tools: [], withheld: [] }) });
  for (const absent of ['list_environments', 'generate_setup', 'execute_setup']) {
    assert.doesNotMatch(html, new RegExp(absent), `${absent} was rendered without being reported`);
  }
});

test('withheld capabilities are shown with their reason, not hidden', () => {
  const html = render();
  assert.match(html, /execute_setup/);
  assert.match(html, /No MCP tool may run a command/);
});

test('the safety boundary is stated on the page itself', () => {
  // A user is about to hand this endpoint to an assistant. "It cannot touch
  // your machine" has to be on the screen, not only in the docs.
  const html = render();
  assert.match(html, /read-only/i);
  assert.match(html, /cannot execute a command/i);
});

test('a failed load still tells the user something useful', () => {
  const html = render({
    connection: null,
    loading: false,
    error: new ApiRequestError('offline', 'Could not reach the ConfigShell API.'),
  });
  assert.match(html, /Could not reach the ConfigShell API/);
  // The setup instructions do not depend on the API, so they stay.
  assert.match(html, /Claude/);
});

test('the loading state renders instead of an empty page', () => {
  const html = render({ connection: null, loading: true });
  assert.match(html, /Loading your connection details/);
  // No URL card yet — better nothing than a placeholder someone might copy.
  assert.doesNotMatch(html, /configshell\.example/);
});

test('setup steps are offered for the hosts the docs name', () => {
  const html = render();
  for (const host of ['Claude', 'ChatGPT', 'Cursor']) {
    assert.match(html, new RegExp(host), `${host} setup steps are missing`);
  }
});
