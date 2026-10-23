import { Search } from 'lucide-react';
import type { NavRoute } from '@/App';
import { Navbar } from '@/components/navbar';

interface SiteHeaderProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  onOpenConnect: () => void;
  connectActive?: boolean;
}

const NAV_ITEMS: { route: NavRoute; label: string; shortLabel: string }[] = [
  { route: 'app-catalog', label: 'Catalog', shortLabel: 'Catalog' },
  { route: 'os-and-distro', label: 'Distributions', shortLabel: 'Distros' },
  { route: 'role-matrix', label: 'Presets', shortLabel: 'Presets' },
  { route: 'plan-and-generate', label: 'Setup plan', shortLabel: 'Plan' },
  { route: 'cli-detection', label: 'Connect', shortLabel: 'Connect' },
];

export function SiteHeader({ activeRoute, onNavigate, onOpenConnect, connectActive }: SiteHeaderProps) {
  const active = (route: NavRoute) => connectActive ? route === 'cli-detection' : route === activeRoute;
  const navigate = (route: NavRoute) => {
    if (route === 'cli-detection') onOpenConnect();
    else onNavigate(route);
  };

  return (
    <Navbar
      layout="inline"
      className="[&>nav]:mx-auto [&>nav]:max-w-7xl"
      logo={(
        <a href="/" onClick={(event) => { event.preventDefault(); navigate('app-catalog'); }} className="site-brand" aria-label="ConfigShell home">
          <span className="site-brand__mark" aria-hidden="true">&gt;_</span>
          <span>ConfigShell</span>
        </a>
      )}
      groups={NAV_ITEMS.map(({ route, label, shortLabel }) => ({ label, shortLabel, href: route, active: active(route) }))}
      actions={(
        <div className="site-header__actions">
          <button
            type="button"
            className="site-icon-button hidden sm:inline-flex"
            aria-label="Focus package search"
            onClick={() => document.getElementById('app-search')?.focus()}
          >
            <Search aria-hidden="true" />
          </button>
          <button type="button" className="site-cta" onClick={() => navigate('app-catalog')}>Choose apps</button>
        </div>
      )}
      onLinkSelect={(href) => navigate(href as NavRoute)}
    />
  );
}
