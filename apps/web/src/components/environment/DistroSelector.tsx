import { cn } from '@/lib/utils';
import { DISTROS, type Distro } from './distros';
import { ecosystemForDistro } from '@configshell/catalog';

interface DistroSelectorProps {
  selected: Distro | null;
  selectedVersion: string | null;
  onSelect: (distro: Distro) => void;
  onSelectVersion: (version: string) => void;
}

/**
 * Large distro cards with version pills — matching Screen 3 section 01.
 */
export function DistroSelector({ selected, selectedVersion, onSelect, onSelectVersion }: DistroSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select a Linux distribution"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {DISTROS.map((distro) => {
        const active = selected === distro.name;
        const ecosystem = ecosystemForDistro(distro.name);
        const monogram = distro.monogram ?? distro.name.slice(0, 2);

        return (
          <div
            key={distro.name}
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={() => onSelect(distro.name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(distro.name);
              }
            }}
            className={cn(
              'relative group flex h-full min-w-0 flex-col p-6 rounded-xl cursor-pointer transition-all duration-300 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
              active
                ? 'bg-surface-card ring-2 ring-primary-container shadow-xl'
                : 'bg-surface-subtle hover:bg-surface-card hover:shadow-xl',
            )}
          >
            {/* Header */}
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                {/* Monogram tile */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105',
                    active ? 'bg-surface-container text-primary-container' : 'bg-surface-container text-text-primary',
                  )}
                >
                  <span className="text-headline-sm font-bold" style={{ color: distro.color }}>
                    {monogram}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-headline-sm text-text-primary">{distro.name}</h3>
                  <span className="block truncate text-label-code-sm text-text-muted">{distro.tagline}</span>
                </div>
              </div>

              {/* Active badge */}
              <span
                aria-hidden={!active}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-label-code-sm font-semibold transition-opacity',
                  active
                    ? 'bg-primary-container text-on-primary opacity-100'
                    : 'opacity-0 pointer-events-none',
                )}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                ACTIVE
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 line-clamp-3 min-h-[60px] text-body-sm text-text-secondary">
              {distro.description}
            </p>

            {/* Version pills */}
            {distro.versions && distro.versions.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <label className="text-label-code-sm text-text-muted">Target Release Channel</label>
                <div className="flex flex-wrap gap-1.5">
                  {distro.versions.map((version) => {
                    const isActiveVersion = active && (selectedVersion === version || (!selectedVersion && distro.versions![0] === version));
                    return (
                      <button
                        key={version}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(distro.name);
                          onSelectVersion(version);
                        }}
                        className={cn(
                          'px-2 py-1 rounded text-label-code-sm transition-colors',
                          isActiveVersion
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container text-text-secondary hover:text-text-primary',
                        )}
                      >
                        {version}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-border-hairline flex items-center justify-between gap-2 text-text-muted text-label-code-sm">
              <span>Core: {ecosystem.toUpperCase()}</span>
              <span className="text-text-secondary">{distro.feature}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
