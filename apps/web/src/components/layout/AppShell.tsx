import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';

interface AppShellProps {
  children: ReactNode;
  /** Navigate to the connect page. Passed through to the header link. */
  onOpenConnect: () => void;
  /** True while the connect page is the current view, for `aria-current`. */
  connectActive?: boolean;
}

/**
 * The one page frame every view shares.
 *
 * Owns the full-height flex column and the site header. Views render their own
 * `<main>` content inside, so the shell is a place, not a template: the header
 * stays put across the build, plan and connect views, and the sticky selection
 * bar on the build view sits above the bottom edge of this column.
 */
export function AppShell({ children, onOpenConnect, connectActive }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <SiteHeader onOpenConnect={onOpenConnect} connectActive={connectActive} />
      {children}
    </div>
  );
}
