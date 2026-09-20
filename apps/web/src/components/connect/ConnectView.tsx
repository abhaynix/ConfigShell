import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Plug,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useClipboard } from '@/hooks/useClipboard';
import { ApiRequestError, fetchMcpConnection, type McpConnection } from '@/lib/api';

/**
 * The "connect ConfigShell to your AI assistant" page.
 *
 * ## Why this is a page and not a paragraph in the README
 *
 * The MCP endpoint is the product's one shareable artifact: a URL a person
 * pastes into Claude, ChatGPT or Cursor. They need to *find* it, and they need
 * to know what happens after they paste it. A README does not help someone who
 * is already looking at the deployed site.
 *
 * ## Why it does not live at `/mcp`
 *
 * `/mcp` is the endpoint itself — it speaks JSON-RPC over Streamable HTTP and a
 * browser visiting it gets protocol frames, not a page. The server mounts it
 * ahead of the SPA fallback for exactly that reason. So the human-facing page
 * is `/connect` and it *shows* the `/mcp` URL.
 *
 * ## Where the URL comes from
 *
 * The server, via `GET /api/mcp`, which derives it from `PUBLIC_BASE_URL`. The
 * browser's own origin is used only as a fallback for display when the API is
 * unreachable, and is labelled as such — a preview or proxy origin is not
 * necessarily the canonical URL a user should save into an AI host.
 */
export function ConnectView({ onBack }: { onBack: () => void }) {
  const [connection, setConnection] = useState<McpConnection | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchMcpConnection()
      .then((result) => {
        if (!active) return;
        setConnection(result);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiRequestError
            ? cause
            : new ApiRequestError('server', 'Could not load the connection details.'),
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return <ConnectPage connection={connection} error={error} loading={loading} onBack={onBack} />;
}

interface ConnectPageProps {
  connection: McpConnection | null;
  error: ApiRequestError | null;
  loading: boolean;
  onBack: () => void;
}

/**
 * The page itself, as a pure function of its state.
 *
 * Split from the fetching wrapper above so every state it can be in — loading,
 * failed, loaded — renders from props alone, which is what lets
 * `ConnectView.test.ts` assert the real markup without a DOM runner.
 */
export function ConnectPage({ connection, error, loading, onBack }: ConnectPageProps) {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
              <Plug aria-hidden="true" className="size-5 shrink-0 text-primary" />
              Connect ConfigShell to your AI
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Give your AI assistant this one URL and it can search ConfigShell's verified
              Linux catalogue, check what works on your distribution, and build you a setup
              plan — while you stay the one who runs anything.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            Back to the catalogue
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Loading your connection details…
            </p>
          )}

          {error && <ConnectionError error={error} />}

          {connection && <McpUrlCard connection={connection} />}

          <HowToConnect />
          <WhatToAsk />
          {connection && <WhatItCanDo connection={connection} />}
          <SafetyNote />
        </div>
      </div>
    </main>
  );
}

/**
 * The URL, and nothing competing with it.
 *
 * This is the one thing a visitor came for, so it gets its own card, the
 * largest type on the page, and a copy button sized for a thumb.
 */
function McpUrlCard({ connection }: { connection: McpConnection }) {
  const { state, copy } = useClipboard();

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-sm">Your ConfigShell MCP URL</CardTitle>
        <p className="text-xs text-muted-foreground">
          Paste this into any MCP-capable assistant. No account, no API key, no sign-in.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
          <code className="min-w-0 flex-1 font-mono text-sm leading-relaxed [overflow-wrap:anywhere] select-all">
            {connection.url}
          </code>
          <Button
            type="button"
            variant="default"
            size="icon-sm"
            className="size-11 shrink-0 sm:size-8"
            onClick={() => copy(connection.url)}
            aria-label={`Copy the MCP URL: ${connection.url}`}
          >
            {state === 'copied' ? (
              <Check aria-hidden="true" />
            ) : state === 'failed' ? (
              <X aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
          </Button>
        </div>

        <span aria-live="polite" className="sr-only">
          {state === 'copied' ? 'MCP URL copied to clipboard' : ''}
          {state === 'failed' ? 'Could not copy. Select the URL text to copy it manually.' : ''}
        </span>

        {state === 'failed' && (
          <p className="mt-2 text-xs text-destructive">
            Couldn't copy automatically — select the URL above instead.
          </p>
        )}

        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>Transport</dt>
            <dd className="font-medium text-foreground">Streamable HTTP</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Authentication</dt>
            <dd className="font-medium text-foreground">
              {connection.authentication === 'none' ? 'None needed' : connection.authentication}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

/**
 * When the API is unreachable the page still has to be useful, so it shows the
 * URL this browser is looking at — clearly labelled as a guess, because a
 * preview or proxy origin is not necessarily the canonical one.
 */
function ConnectionError({ error }: { error: ApiRequestError }) {
  const guessed =
    typeof window === 'undefined' ? null : `${window.location.origin}/mcp`;

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Couldn't load the connection details</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {guessed && (
          <p className="mt-2">
            Based on the address you are viewing, the endpoint is most likely{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{guessed}</code>.
            Confirm it against this deployment's own configuration before saving it into an
            assistant.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

const HOSTS = [
  {
    name: 'Claude',
    steps: [
      'Open Settings → Connectors.',
      'Choose "Add custom connector".',
      'Paste the URL above and save.',
    ],
    note: 'Available on Free, Pro, Max, Team and Enterprise. Free plans are limited to one custom connector.',
  },
  {
    name: 'ChatGPT',
    steps: [
      'Enable developer mode for your workspace.',
      'Go to Settings → Connectors → Advanced.',
      'Add the URL above as a custom MCP connector.',
    ],
    note: 'Custom MCP connectors need developer mode, which a workspace owner enables.',
  },
  {
    name: 'Cursor / VS Code',
    steps: [
      'Open your MCP server settings.',
      'Add a server of type "HTTP" (Streamable HTTP).',
      'Use the URL above as the endpoint.',
    ],
    note: 'Any client that speaks Streamable HTTP works — nothing here is client-specific.',
  },
];

function HowToConnect() {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-sm font-medium">
        How to connect it
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Menu names move around between releases; if these do not match exactly, look for
        "connectors" or "MCP servers" in your assistant's settings.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {HOSTS.map((host) => (
          <Card key={host.name}>
            <CardHeader>
              <CardTitle className="text-sm">{host.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex list-decimal flex-col gap-1.5 pl-4 text-xs text-muted-foreground">
                {host.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground/80">
                {host.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

const EXAMPLE_PROMPTS = [
  'I just installed Fedora for full-stack web development. What should I set up?',
  'Is Docker available on openSUSE, and where does it come from?',
  'Compare VS Code, Zed and Neovim for me, then give me commands for Arch.',
  'Build me a setup plan for Ubuntu with Git, Node.js and a browser.',
];

function WhatToAsk() {
  return (
    <section aria-labelledby="ask-heading">
      <h2 id="ask-heading" className="text-sm font-medium">
        What to ask once it is connected
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Talk to your assistant normally. It decides when to call ConfigShell, and it explains
        the answers in its own words — ConfigShell supplies the facts, not the conversation.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <li
            key={prompt}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
          >
            “{prompt}”
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Both halves of the contract: what it does, and what it will never do.
 *
 * The withheld capabilities are listed as prominently as the tools. Someone
 * deciding whether to connect this to their assistant is entitled to know where
 * the boundary is, and "it cannot see or change your machine" is the reassuring
 * half of the answer, not the embarrassing one.
 */
function WhatItCanDo({ connection }: { connection: McpConnection }) {
  return (
    <section aria-labelledby="tools-heading">
      <h2 id="tools-heading" className="text-sm font-medium">
        What your assistant gains
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {connection.tools.length} read-only tools over the verified catalogue.
      </p>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {connection.tools.map((tool) => (
          <li key={tool.name} className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-medium">{tool.title}</p>
            <code className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
              {tool.name}
            </code>
          </li>
        ))}
      </ul>

      {connection.withheld.length > 0 && (
        <>
          <Separator className="my-4" />
          <h3 className="text-sm font-medium">What it deliberately cannot do</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            These are not missing features. They are capabilities ConfigShell refuses to
            expose, because they would need access to your machine.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {connection.withheld.map((capability) => (
              <li
                key={capability.name}
                className="flex flex-col gap-1 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-baseline sm:gap-3"
              >
                <Badge variant="outline" className="w-fit shrink-0 font-mono text-[11px]">
                  {capability.name}
                </Badge>
                <span className="text-xs text-muted-foreground">{capability.reason}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function SafetyNote() {
  return (
    <section aria-labelledby="safety-heading">
      <h2 id="safety-heading" className="sr-only">
        Safety
      </h2>
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Nothing here can touch your machine.</p>
          <p className="mt-1">
            ConfigShell returns install commands as <em>text</em>, for you to read and run
            yourself. The endpoint is read-only: it cannot execute a command, detect your
            system, see what you already have installed, or change anything. Every command
            comes from the verified catalogue — your assistant is told never to edit one or
            substitute a package name of its own.
          </p>
        </div>
      </div>
    </section>
  );
}
