import { cn } from '@/lib/utils';
import type { Application } from '@configshell/catalog';
import { CATEGORY_ICON } from './categoryIcon';

interface AppCardProps {
  app: Application;
  selected: boolean;
  onToggle: (id: string) => void;
  onOpenDetails: (app: Application) => void;
}

/**
 * App catalog card — matching Screen 1 design.
 * 40px icon tile, name, "Category · version" in mono,
 * star rating, tag chips, description, toggle button.
 */
export function AppCard({ app, selected, onToggle, onOpenDetails }: AppCardProps) {
  const Icon = CATEGORY_ICON[app.category];
  const hiddenSourceCount = Math.max(app.installation.length - 3, 0);

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 flex-col gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_17rem]',
        selected
          ? 'bg-surface-card ring-2 ring-primary-container'
          : 'bg-surface-subtle hover:bg-surface-card',
      )}
      aria-label={`${app.name}${selected ? ', in plan' : ''}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        {/* Icon tile */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            selected ? 'bg-primary-container/20 text-primary' : 'bg-surface-container text-text-secondary group-hover:text-primary',
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Detail button */}
        <button
          type="button"
          aria-label={`Details for ${app.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(app);
          }}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
        >
          <span className="material-symbols-outlined text-[15px]">info</span>
        </button>
      </div>

      {/* Name + meta */}
      <div className="flex min-w-0 flex-col gap-0.5 flex-1">
        <span className="truncate text-body-sm font-medium text-text-primary leading-tight" title={app.name}>{app.name}</span>
        <span className="text-label-code-sm text-text-muted">
          {app.category}
          {app.featured && ' · ★ Featured'}
        </span>
      </div>

      {/* Description */}
      <p className="min-h-8 text-label-code-sm text-text-secondary line-clamp-2 leading-relaxed">
        {app.description}
      </p>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {app.installation.slice(0, 3).map((src) => (
          <span
            key={src.method + src.identifier}
            className="px-1.5 py-0.5 rounded text-label-code-sm bg-surface-container text-text-muted border border-border-hairline"
          >
            {src.method}
          </span>
        ))}
        {hiddenSourceCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-label-code-sm bg-surface-container text-text-muted border border-border-hairline">
            +{hiddenSourceCount}
          </span>
        )}
        {app.installation.length === 0 && (
          <span className="px-1.5 py-0.5 rounded text-label-code-sm bg-surface-container text-error border border-error/20">
            no verified source
          </span>
        )}
      </div>

      {/* Footer: hint + toggle */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-hairline mt-auto">
        <span className="text-label-code-sm text-text-muted truncate">
          {app.installation[0]?.method === 'flatpak' ? 'Flatpak Ready' :
           app.installation[0]?.method === 'snap' ? 'Snap Package' :
           app.installation[0]?.method === 'apt' ? 'APT / DEB' :
           app.installation[0]?.method === 'dnf' ? 'DNF / RPM' :
           app.installation[0]?.method === 'pacman' ? 'Pacman / AUR' : 'Ansible Role Ready'}
        </span>

        <button
          type="button"
          aria-pressed={selected}
          aria-label={selected ? `Remove ${app.name} from plan` : `Add ${app.name} to plan`}
          onClick={() => onToggle(app.id)}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-full text-label-code-sm font-medium transition-all duration-150 shrink-0',
            selected
              ? 'bg-primary-container text-on-primary hover:bg-primary-container/80'
              : 'bg-surface-container text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-hairline',
          )}
        >
          <span className="material-symbols-outlined text-[13px]">
            {selected ? 'check' : 'add'}
          </span>
          {selected ? 'In Plan' : 'Add to Plan'}
        </button>
      </div>
    </article>
  );
}
