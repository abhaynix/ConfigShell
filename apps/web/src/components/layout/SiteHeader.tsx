import { useEffect, useRef, useState, useCallback } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import type { NavRoute } from '@/App';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  onOpenConnect: () => void;
  connectActive?: boolean;
}

const NAV_ITEMS: { route: NavRoute; label: string }[] = [
  { route: 'app-catalog',       label: 'App Catalog' },
  { route: 'os-and-distro',     label: 'OS & Distro' },
  { route: 'role-matrix',       label: 'Role Matrix' },
  { route: 'plan-and-generate', label: 'Plan & Generate' },
  { route: 'cli-detection',     label: 'CLI Detection' },
  { route: 'docs',              label: 'Docs' },
];

export function SiteHeader({ activeRoute, onNavigate, connectActive }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state: clipState, copy } = useClipboard();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent, route: NavRoute) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(route);
  }, [onNavigate]);

  const isActive = (route: NavRoute) => {
    if (connectActive) return route === 'cli-detection';
    return route === activeRoute;
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-200',
          scrolled
            ? 'bg-surface-subtle/90 backdrop-blur-md border-border-hairline'
            : 'bg-surface-subtle/90 backdrop-blur-md border-border-hairline',
        )}
      >
        <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Left: Logo + Daemon pill + Nav */}
          <div className="flex min-w-0 shrink-0 items-center gap-3 2xl:gap-6">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); onNavigate('app-catalog'); }}
              className="flex shrink-0 items-center gap-2 group focus-visible:outline-none"
              aria-label="ConfigShell home"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-border-hairline flex items-center justify-center text-primary group-hover:border-primary-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-headline-sm text-text-primary tracking-tight">ConfigShell</span>
                <span className="hidden sm:inline text-label-code-sm text-secondary bg-surface-card border border-border-hairline px-1.5 py-0.5 rounded-full">v2.4</span>
              </div>
            </a>

            {/* Daemon Connected pill — 2xl only */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card border border-border-hairline">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
              </span>
              <span className="text-label-code-sm text-text-secondary">Daemon Connected</span>
            </div>

            {/* Desktop nav pills */}
            <nav
              className="hidden 2xl:flex min-w-0 items-center gap-1.5 p-1 rounded-full bg-surface-subtle border border-border-hairline"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map(({ route, label }) => (
                <a
                  key={route}
                  href={route === 'cli-detection' ? '/connect' : '/'}
                  aria-current={isActive(route) ? 'page' : undefined}
                  onClick={(e) => handleNavClick(e, route)}
                  className={cn(
                    'px-3 py-1 rounded-full whitespace-nowrap text-body-sm transition-colors',
                    isActive(route)
                      ? 'bg-surface-card text-text-primary border border-border-hover'
                      : 'text-on-surface-variant hover:text-text-primary border border-transparent',
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Search + CLI copy + GitHub + Theme + Avatar */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Search button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('app-search') as HTMLInputElement | null;
                el?.focus();
              }}
              className="hidden lg:flex min-w-0 items-center gap-2 h-9 px-3 rounded-lg bg-surface-card border border-border-hairline hover:border-border-hover text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:border-border-focus"
              aria-label="Search config (⌘K)"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span className="text-body-sm">Search config...</span>
              <kbd className="text-label-code-sm px-1.5 py-0.5 rounded bg-surface-container-high border border-border-hairline text-text-secondary">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('app-search')?.focus()}
              className="flex lg:hidden w-9 h-9 items-center justify-center rounded-lg bg-surface-card border border-border-hairline text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="Search config"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>

            {/* npx copy pill */}
            <div className="hidden md:flex items-center h-9 px-3 rounded-full bg-surface-card border border-border-hairline text-text-secondary hover:border-border-hover group transition-colors">
              <span className="text-label-code-sm text-primary mr-1.5">$</span>
              <code className="text-label-code-sm text-text-primary mr-2">npx configshell@latest</code>
              <button
                type="button"
                aria-label="Copy CLI command"
                onClick={() => copy('npx configshell@latest')}
                className="text-text-muted group-hover:text-text-primary transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {clipState === 'copied' ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>

            {/* GitHub */}
            <a
              href="https://github.com/AbhiDevepl/configshell"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-card border border-border-hairline hover:border-border-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="View source on GitHub"
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              <span className="text-body-sm">GitHub</span>
              <span className="text-label-code-sm px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary border border-border-hairline">★ 4.8k</span>
            </a>

            {/* Theme button (decorative — dark only) */}
            <button
              type="button"
              aria-label="Color scheme: dark (fixed)"
              className="w-9 h-9 rounded-lg bg-surface-card border border-border-hairline hover:border-border-hover text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="xl:hidden w-9 h-9 rounded-lg bg-surface-card border border-border-hairline flex items-center justify-center text-text-secondary"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-border-hairline bg-surface-subtle">
            <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map(({ route, label }) => (
                <a
                  key={route}
                  href={route === 'cli-detection' ? '/connect' : '/'}
                  aria-current={isActive(route) ? 'page' : undefined}
                  onClick={(e) => handleNavClick(e, route)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-body-sm transition-colors',
                    isActive(route)
                      ? 'bg-surface-card text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-card',
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
