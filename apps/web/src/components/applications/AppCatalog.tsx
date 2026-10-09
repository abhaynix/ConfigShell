import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';
import {
  APPLICATIONS,

  searchApplications,
  type Application,
  type Category,
  type Distro,
} from '@configshell/catalog';
import { AppCard } from './AppCard';

interface AppCatalogProps {
  selectedIds: Set<string>;
  distro: Distro | null;
  onToggle: (id: string) => void;
  onOpenDetails: (app: Application) => void;
  onContinue: () => void;
  canContinue: boolean;
  blockedReason: string;
}

const CATEGORY_PILL_LABELS: (Category | 'All')[] = [
  'All',
  'General',
  'Student',
  'Developer',
  'Web Developer',
  'DevOps',
  'Data & AI',
  'Content Creator',
  'Gaming',
];

const DISTRO_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'Compatibility: All Distros' },
  { value: 'Ubuntu', label: 'Ubuntu 24.04 LTS' },
  { value: 'Debian', label: 'Debian 12 (Bookworm)' },
  { value: 'Fedora', label: 'Fedora 40' },
  { value: 'Arch Linux', label: 'Arch Linux (Rolling)' },
  { value: 'openSUSE', label: 'openSUSE Tumbleweed' },
];

/**
 * Screen 1 — App Catalog.
 * Hero, CLI banner, toolbar, 4-col card grid.
 */
export function AppCatalog({
  selectedIds,
  distro,
  onToggle,
  onOpenDetails,
  onContinue: _onContinue,
  canContinue: _canContinue,
  blockedReason: _blockedReason,
}: AppCatalogProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [distroFilter, setDistroFilter] = useState<string>('All');
  const tabsListId = useId();
  const catalogRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const shouldScrollResults = useRef(false);

  const { state: clipState, copy } = useClipboard();

  const selectedApps = useMemo(
    () => APPLICATIONS.filter((a) => selectedIds.has(a.id)),
    [selectedIds],
  );

  const cliCommand = useMemo(() => {
    const ids = selectedApps.map((a) => a.id).join(' ');
    return ids ? `npx configshell add ${ids}` : 'npx configshell add <select apps below>';
  }, [selectedApps]);

  const filtered = useMemo(() =>
    searchApplications({
      query,
      category: activeCategory === 'All' ? undefined : activeCategory,
    }),
    [query, activeCategory],
  );

  // Active distro for CLI banner tabs
  const activeBannerDistro = distro ?? 'Ubuntu';

  useEffect(() => {
    if (!shouldScrollResults.current) return;
    shouldScrollResults.current = false;
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [activeCategory, query]);

  return (
    <section ref={catalogRef} aria-labelledby="catalog-heading" className="flex flex-col gap-10">
      {/* HERO */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-4 pt-4">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border-hairline shadow-lg">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
          </span>
          <span className="text-label-code-sm text-primary tracking-wide">Built from the chaiui/registry</span>
          <span className="text-text-muted">·</span>
          <span className="text-label-code-sm text-text-secondary">v2.4 Live Recipes</span>
        </div>

        <h1
          id="catalog-heading"
          className="text-headline-xl-mobile lg:text-headline-xl text-text-primary tracking-tight"
        >
          The Linux Catalog, as recipes you own
        </h1>

        <p className="text-body-lg text-text-secondary max-w-2xl">
          A curated registry of Linux server &amp; workstation packages, tools, and roles configured for your exact distro.
          Install individually or compose into an Ansible/Bash provisioning plan.
        </p>
      </div>

      {/* CLI BANNER */}
      <div className="w-full max-w-4xl mx-auto rounded-xl bg-surface-subtle shadow-xl overflow-hidden border border-border-hairline">
        {/* Terminal header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-surface-card/70 gap-y-2 border-b border-border-hairline">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5 mr-2" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            </div>
            <span className="text-label-code-sm text-text-muted">Target Host Agent:</span>
            {/* Distro tabs */}
            <div className="inline-flex min-w-0 flex-wrap items-center gap-1 p-0.5 rounded-lg bg-surface-base" role="tablist" aria-label="Select target distro for CLI command">
              {(['Ubuntu', 'Debian', 'Fedora', 'Arch Linux', 'openSUSE'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={activeBannerDistro === d}
                  onClick={() => setDistroFilter(d)}
                  className={cn(
                    'px-2.5 py-0.5 rounded text-label-code-sm transition-colors',
                    activeBannerDistro === d
                      ? 'bg-surface-card text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-secondary',
                  )}
                >
                  {d === 'Arch Linux' ? 'Arch' : d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-1 text-label-code-sm text-secondary">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Instant Shell Execution</span>
          </div>
        </div>

        {/* CLI command row */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-subtle">
          <div className="flex min-w-0 items-center gap-3 w-full overflow-x-auto">
            <span className="text-label-code-md text-primary select-none shrink-0">$</span>
            <code className="text-label-code-md text-text-primary whitespace-nowrap">{cliCommand}</code>
          </div>
          <button
            type="button"
            onClick={() => copy(cliCommand)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-surface-card hover:bg-surface-hover text-text-primary text-body-sm shadow-sm transition-all group"
          >
            <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">
              {clipState === 'copied' ? 'check' : 'content_copy'}
            </span>
            {clipState === 'copied' ? 'Copied!' : 'Copy Recipe'}
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-lg min-w-0">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input
              id="app-search"
              type="search"
              value={query}
              onChange={(e) => { shouldScrollResults.current = true; setQuery(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (query) setQuery('');
                  else (e.target as HTMLElement).blur();
                }
              }}
              placeholder="Filter packages by name, binary, or role..."
              className="w-full h-10 pl-10 pr-16 bg-surface-card rounded-lg text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-subtle focus:ring-1 focus:ring-border-focus transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-label-code-sm text-text-secondary">
              ⌘K
            </kbd>
          </div>

          {/* Secondary actions */}
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {/* Distro filter */}
            <div className="relative inline-flex items-center">
              <label className="sr-only" htmlFor={`${tabsListId}-distro`}>Distro Filter</label>
              <select
                id={`${tabsListId}-distro`}
                value={distroFilter}
                onChange={(e) => setDistroFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-lg bg-surface-card text-text-secondary text-body-sm focus:outline-none cursor-pointer appearance-none border border-border-hairline"
              >
                {DISTRO_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-text-muted text-[16px]">expand_more</span>
            </div>

            {/* View switcher */}
            <div className="inline-flex p-1 rounded-lg bg-surface-card items-center gap-0.5">
              <button
                type="button"
                aria-label="Grid view"
                className="p-1.5 rounded bg-surface-hover text-text-primary"
              >
                <span className="material-symbols-outlined text-[18px] block">grid_view</span>
              </button>
              <button
                type="button"
                aria-label="List view"
                className="p-1.5 rounded text-text-muted hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] block">view_list</span>
              </button>
            </div>

            {/* Selected count badge */}
            <div className="h-10 px-3.5 rounded-lg bg-primary-container/15 text-primary flex items-center gap-2 text-label-code-sm">
              <span className="material-symbols-outlined text-[16px]">check_box</span>
              <span>{selectedIds.size} apps selected</span>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto snap-x snap-mandatory pb-1" role="tablist" aria-label="Filter by category" id={tabsListId}>
          {CATEGORY_PILL_LABELS.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => { shouldScrollResults.current = true; setActiveCategory(cat as Category | 'All'); }}
              className={cn(
                'h-9 whitespace-nowrap snap-start px-3.5 rounded-full text-body-sm font-medium transition-all active:scale-95 shrink-0',
                activeCategory === cat
                  ? 'bg-text-primary text-surface-base shadow-sm'
                  : 'bg-surface-card text-text-secondary hover:text-text-primary',
              )}
            >
              <span>{cat}</span><span className="ml-1 text-[10px] opacity-70">{cat === 'All' ? APPLICATIONS.length : APPLICATIONS.filter((app) => app.category === cat).length}</span>
            </button>
          ))}
        </div>

        {/* Active filter info */}
        <div className="flex items-center justify-between text-label-code-sm text-text-muted">
          <div className="min-w-0">
            <span>
              Showing <span className="text-text-primary">{filtered.length}</span> of {APPLICATIONS.length}
              {activeCategory !== 'All' && (
                <> in <span className="text-text-primary">{activeCategory}</span></>
              )}
              {query.trim() && (
                <> matching "<span className="text-text-primary">{query.trim()}</span>"</>
              )}
            </span>
          </div>
          {(activeCategory !== 'All' || query.trim()) && <button
              type="button"
              onClick={() => { shouldScrollResults.current = true; setQuery(''); setActiveCategory('All'); }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>}
        </div>
      </div>

      {/* CARD GRID */}
      <div ref={resultsRef} className="scroll-mt-20">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 rounded-xl bg-surface-subtle border border-border-hairline border-dashed">
            <span className="material-symbols-outlined text-[40px] text-text-muted">search_off</span>
            <div className="text-center">
              <p className="text-headline-sm text-text-primary">No packages found</p>
              <p className="text-body-sm text-text-secondary mt-1">
                Try a different search term or category.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { shouldScrollResults.current = true; setQuery(''); setActiveCategory('All'); }}
              className="px-4 py-2 rounded-full bg-surface-card text-text-primary text-body-sm hover:bg-surface-hover transition-colors"
            >
              Browse all packages
            </button>
          </div>
        ) : (
          <div
            role="region"
            aria-label="Application catalog"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                selected={selectedIds.has(app.id)}
                onToggle={onToggle}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust strip */}
      <div className="w-full max-w-4xl mx-auto rounded-xl bg-surface-subtle border border-border-hairline p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-label-code-sm text-primary uppercase tracking-wider font-semibold">
            Idempotent ChaiCode Registry Recipes
          </span>
          <span className="text-body-sm text-text-secondary">
            {APPLICATIONS.length} verified packages · All sources independently verified
          </span>
        </div>
        {/* Simple sparkline */}
        <svg className="w-32 h-8 text-primary opacity-60" fill="none" viewBox="0 0 128 32" aria-hidden="true">
          <path
            d="M0 28L16 22L32 26L48 16L64 20L80 10L96 14L112 6L128 10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M0 28L16 22L32 26L48 16L64 20L80 10L96 14L112 6L128 10V32H0Z"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </section>
  );
}
