import { useEffect, useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchApplications, type Application, type Category } from '@configshell/catalog';
import { AppCard } from './AppCard';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { CATEGORY_ICON, CATEGORY_ID } from './categoryIcon';

export interface AppCatalogProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onOpenDetails: (app: Application) => void;
}

const CATEGORIES: (Category | 'All')[] = ['All', 'General', 'Student', 'Developer', 'Web Developer', 'DevOps', 'Data & AI', 'Content Creator', 'Gaming'];

export function AppCatalog({ selectedIds, onToggle, onOpenDetails }: AppCatalogProps) {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<'name' | 'category'>('name');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const tabsId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    const results = searchApplications({ query, category: category === 'All' ? undefined : category });
    return [...results].sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name)
      : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [query, category, sort]);

  return (
    <section aria-labelledby="catalog-heading" className="page-section flex flex-col gap-8">
      <SectionHeading
        as="h2"
        id="catalog-heading"
        eyebrow="Application catalog · Step 3"
        title="The Linux Catalog"
        description="Find apps, then review a setup plan for your selected distribution."
      />

      <div className="catalog-toolbar">
        <div className="catalog-toolbar__top">
          <label className="catalog-search" htmlFor="app-search">
            <Search size={18} aria-hidden="true" />
            <input
              id="app-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search applications"
              autoComplete="off"
            />
            {searchInput && <button type="button" className="catalog-search__clear" aria-label="Clear search" onClick={() => setSearchInput('')}><X size={16} aria-hidden="true" /></button>}
          </label>

          <div className="catalog-controls" aria-label="Catalog display controls">
            <label className="catalog-sort-label" htmlFor="catalog-sort">Sort</label>
            <select id="catalog-sort" className="catalog-sort" value={sort} onChange={(event) => setSort(event.target.value as 'name' | 'category')}>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
            <div className="catalog-view" role="group" aria-label="View mode">
              <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}>Grid</button>
              <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}>List</button>
            </div>
          </div>
        </div>

        <div className="category-scroll" role="tablist" aria-label="Filter by category" id={tabsId}>
          {CATEGORIES.map((item) => {
            const Icon = item === 'All' ? null : CATEGORY_ICON[item];
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                onClick={() => setCategory(item)}
                className={cn('category-chip', category === item && 'is-active')}
                data-category={item === 'All' ? undefined : CATEGORY_ID[item]}
              >
                {Icon && <Icon className="category-chip__icon" aria-hidden="true" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="catalog-state">
          <h3>No packages match your filters</h3>
          <p>Change your search or category, or clear the filters to browse the catalog.</p>
          <button type="button" className="secondary-button" onClick={() => { setSearchInput(''); setCategory('All'); }}>Clear filters</button>
        </div>
      ) : (
        <div className={cn('catalog-grid', view === 'list' && 'catalog-grid--list')} role="region" aria-label="Application catalog">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} selected={selectedIds.has(app.id)} onToggle={onToggle} onOpenDetails={onOpenDetails} />
          ))}
        </div>
      )}
    </section>
  );
}
