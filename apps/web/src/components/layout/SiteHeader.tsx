import { useEffect, useRef, useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import type { NavRoute } from '@/App';
import { PageContainer } from './PageContainer';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  onOpenConnect: () => void;
  connectActive?: boolean;
}

const NAV_ITEMS: { route: NavRoute; label: string; short: string }[] = [
  { route: 'app-catalog', label: 'Catalog', short: 'Catalog' },
  { route: 'os-and-distro', label: 'Distributions', short: 'Distros' },
  { route: 'role-matrix', label: 'Presets', short: 'Presets' },
  { route: 'plan-and-generate', label: 'Setup plan', short: 'Plan' },
  { route: 'cli-detection', label: 'Connect', short: 'Connect' },
];

export function SiteHeader({ activeRoute, onNavigate, onOpenConnect, connectActive }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const links = drawerRef.current?.querySelectorAll<HTMLElement>('a, button');
    links?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !links?.length) return;
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      menuButton?.focus();
    };
  }, [menuOpen]);

  const active = (route: NavRoute) => connectActive ? route === 'cli-detection' : route === activeRoute;
  const navigate = (route: NavRoute) => {
    setMenuOpen(false);
    if (route === 'cli-detection') onOpenConnect();
    else onNavigate(route);
  };

  return (
    <>
      <header className="site-header">
        <PageContainer className="site-header__row">
          <a href="/" onClick={(event) => { event.preventDefault(); navigate('app-catalog'); }} className="site-brand" aria-label="ConfigShell home">
            <span className="site-brand__mark" aria-hidden="true">&gt;_</span>
            <span>ConfigShell</span>
          </a>

          <nav className="site-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ route, label, short }) => (
              <a
                key={route}
                href={route === 'cli-detection' ? '/connect' : '/'}
                aria-current={active(route) ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); navigate(route); }}
                className={cn('site-nav__link', active(route) && 'is-active')}
              >
                <span className="hidden lg:inline">{label}</span>
                <span className="lg:hidden">{short}</span>
              </a>
            ))}
          </nav>

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
            <button
              ref={menuButtonRef}
              type="button"
              className="site-icon-button site-menu-button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </PageContainer>
      </header>

      {menuOpen && (
        <div className="mobile-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
          <nav id="mobile-navigation" ref={drawerRef} className="mobile-drawer" aria-label="Mobile navigation" aria-modal="true" role="dialog">
            <p className="mobile-drawer__label">Navigate</p>
            {NAV_ITEMS.map(({ route, label }) => (
              <a
                key={route}
                href={route === 'cli-detection' ? '/connect' : '/'}
                aria-current={active(route) ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); navigate(route); }}
                className={cn('mobile-drawer__link', active(route) && 'is-active')}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
