import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import type { NavRoute } from '@/App';

interface AppShellProps {
  children: ReactNode;
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  onOpenConnect: () => void;
  connectActive?: boolean;
}

/**
 * The one page frame every view shares.
 * Dark-only, bg-surface-base, full-height flex column.
 */
export function AppShell({ children, activeRoute, onNavigate, onOpenConnect, connectActive }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-surface-base text-on-surface">
      <SiteHeader
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        onOpenConnect={onOpenConnect}
        connectActive={connectActive}
      />
      {children}
    </div>
  );
}
