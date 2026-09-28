import { Kbd } from '@/components/ui/kbd';

interface StatusBarProps {
  view?: 'build' | 'plan' | 'connect';
}

/**
 * Small status bar at the bottom of the page showing key shortcuts
 * for accessibility and power-user discovery.
 */
export function StatusBar({ view = 'build' }: StatusBarProps) {
  return (
    <aside
      aria-label="Keyboard shortcuts status bar"
      className="w-full border-t border-border/50 bg-card/60 backdrop-blur-xs py-2 px-4 text-xs text-muted-foreground print:hidden transition-colors"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          <span className="font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">Shortcuts</span>
          {view === 'build' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>/</Kbd>
                <span className="text-foreground/80 font-medium">for Search</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>Alt+C</Kbd>
                <span className="text-foreground/80 font-medium">for Clear</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>Ctrl+Enter</Kbd>
                <span className="text-foreground/80 font-medium">for Build</span>
              </span>
            </>
          ) : view === 'plan' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>Esc</Kbd>
                <span className="text-foreground/80 font-medium">for Back</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>Alt+Y</Kbd>
                <span className="text-foreground/80 font-medium">for Copy all</span>
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              <span className="text-foreground/80 font-medium">for Back</span>
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground/60">
          <span>ConfigShell</span>
          <span aria-hidden="true">&bull;</span>
          <span>Plans and validates &bull; Never executes</span>
        </div>
      </div>
    </aside>
  );
}
