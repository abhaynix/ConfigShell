import { useRef } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';
import type { PlanCommand } from '@/lib/api';

interface CommandBlockSingleProps {
  command: string;
  privileged: boolean;
  summary?: string;
  note?: string;
  commands?: never;
}

interface CommandBlockMultiProps {
  commands: PlanCommand[];
  command?: never;
  privileged?: never;
  summary?: never;
  note?: never;
}

type CommandBlockProps = CommandBlockSingleProps | CommandBlockMultiProps;

/**
 * Renders one command or an array of plan commands.
 *
 * When `commands` (array) is supplied, renders a numbered line table with
 * syntax-style coloring. When `command` (string) is supplied, renders the
 * original single-command card.
 *
 * Commands are always shown in full — never truncated — because the user is
 * being asked to run them on their own machine. Nothing here executes anything.
 */
export function CommandBlock(props: CommandBlockProps) {
  if (props.commands) {
    return <MultiCommandBlock commands={props.commands} />;
  }
  return (
    <SingleCommandBlock
      command={props.command!}
      privileged={props.privileged!}
      summary={props.summary}
      note={props.note}
    />
  );
}

function MultiCommandBlock({ commands }: { commands: PlanCommand[] }) {
  return (
    <div className="font-mono text-label-code-md space-y-1">
      {commands.map((cmd, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <span className="text-text-muted w-6 text-right shrink-0 select-none">{i + 1}</span>
          <span className={cn(
            'flex-1 break-all',
            cmd.privileged ? 'text-secondary' : 'text-text-primary',
          )}>
            {cmd.command}
          </span>
        </div>
      ))}
    </div>
  );
}

function SingleCommandBlock({
  command,
  privileged,
  summary,
  note,
}: {
  command: string;
  privileged: boolean;
  summary?: string;
  note?: string;
}) {
  const { state, copy } = useClipboard();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="rounded-xl border border-border-hairline bg-surface-card">
      {(summary || privileged) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline px-4 py-2.5">
          {summary && <p className="text-label-code-sm text-text-secondary">{summary}</p>}
          {privileged && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-label-code-sm">
              <span className="material-symbols-outlined text-[13px]">shield</span>
              Runs as root
            </span>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        <span className="text-primary text-label-code-md shrink-0 select-none">$</span>
        <code className="min-w-0 flex-1 font-mono text-label-code-md text-text-primary leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] select-all">
          {command}
        </code>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => copy(command)}
          aria-label={`Copy: ${command}`}
          className="shrink-0 w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {state === 'copied' ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Command copied to clipboard' : ''}
      </span>

      {note && (
        <p className="border-t border-border-hairline px-4 py-2.5 text-label-code-sm text-text-muted">{note}</p>
      )}
    </div>
  );
}
