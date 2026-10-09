import { cn } from '@/lib/utils';
import { ROLES, applicationsForRole, type Role } from '@configshell/catalog';

interface RoleSelectorProps {
  appliedRoleId: string | null;
  onApply: (role: Role) => void;
  onClear: () => void;
}

/* Role metadata for icons and descriptions */
const ROLE_META: Record<string, { icon: string; ports?: string; kernel?: string }> = {
  general:          { icon: 'laptop',         ports: '80/443',      kernel: 'Generic' },
  student:          { icon: 'school',          ports: '3000/8080',   kernel: 'Desktop' },
  developer:        { icon: 'code',            ports: '3000/8080',   kernel: '≥ 5.15 LTS' },
  'web-developer':  { icon: 'language',        ports: '80/443/3000', kernel: '≥ 5.15 LTS' },
  devops:           { icon: 'deployed_code',   ports: '22/80/443',   kernel: '≥ 6.1 LTS' },
  'data-ai':        { icon: 'psychology',      ports: '8888/8080',   kernel: 'CUDA ≥ 12' },
  'content-creator':{ icon: 'video_camera_front', ports: '—',       kernel: 'Desktop' },
  gaming:           { icon: 'sports_esports',  ports: '—',           kernel: 'Desktop LTS' },
};

/**
 * Screen 3 section 02 — Server Archetype Presets.
 * 12-col bento: first card spans 7, second spans 5, rest span 4 each.
 */
export function RoleSelector({ appliedRoleId, onApply, onClear }: RoleSelectorProps) {
  return (
    <section aria-labelledby="role-heading" className="flex flex-col gap-8">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-label-code-sm text-primary uppercase tracking-widest font-semibold">
            02 // ROLE &amp; PLAYBOOK BUNDLES
          </span>
          <h2 id="role-heading" className="text-headline-lg text-text-primary">
            Server Archetype Presets
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-body-sm text-text-secondary max-w-sm">
            Optional. Select a preset archetype to pre-load a curated set of packages.
          </p>
          {appliedRoleId && (
            <button
              type="button"
              onClick={onClear}
              className="text-label-code-sm text-text-muted hover:text-text-primary transition-colors shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {ROLES.map((role, idx) => {
          const applied = appliedRoleId === role.id;
          const meta = ROLE_META[role.id] ?? { icon: 'apps' };
          const recommended = applicationsForRole(role, 'recommended');
          const pkgCount = recommended.length;

          // Bento spans: first=7, second=5, rest=4
          const colSpan =
            idx === 0 ? 'lg:col-span-7' :
            idx === 1 ? 'lg:col-span-5' :
            'lg:col-span-4';

          return (
            <div
              key={role.id}
              role="button"
              tabIndex={0}
              onClick={() => onApply(role)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onApply(role);
                }
              }}
              aria-pressed={applied}
              aria-label={`${applied ? 'Applied: ' : ''}${role.name} preset — ${pkgCount} packages`}
              className={cn(
                'group relative flex h-full min-w-0 flex-col gap-4 p-6 rounded-xl cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
                colSpan,
                applied
                  ? 'bg-surface-card ring-2 ring-primary-container shadow-xl'
                  : 'bg-surface-subtle hover:bg-surface-card hover:shadow-md',
              )}
            >
              {/* Card header */}
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                      applied ? 'bg-primary-container/20 text-primary' : 'bg-surface-container text-text-secondary group-hover:text-primary',
                    )}
                  >
                    <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-label-code-sm text-text-muted uppercase tracking-wider">
                      {role.id.replace(/-/g, ' ')}
                    </span>
                    <h3 className="truncate text-headline-sm text-text-primary">{role.name}</h3>
                  </div>
                </div>

                {/* Applied badge */}
                <span
                  aria-hidden={!applied}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-label-code-sm font-semibold transition-opacity shrink-0',
                    applied
                      ? 'bg-primary-container text-on-primary opacity-100'
                      : 'opacity-0 pointer-events-none',
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  PRESET LOADED
                </span>
              </div>

              {/* Description */}
              <p className="text-body-sm text-text-secondary line-clamp-2">{role.description}</p>

              {/* Package chips */}
              <div className="flex flex-wrap gap-1.5">
                {recommended.slice(0, 5).map((app) => (
                  <span
                    key={app.id}
                    className="px-2 py-0.5 rounded-full bg-surface-container text-label-code-sm text-text-secondary border border-border-hairline"
                  >
                    {app.name}
                  </span>
                ))}
                {pkgCount > 5 && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-label-code-sm text-text-muted border border-border-hairline">
                    +{pkgCount - 5} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-border-hairline flex items-center justify-between gap-2 text-label-code-sm text-text-muted">
                <span>
                  {meta.ports && <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">settings_ethernet</span>
                    {meta.ports}
                  </span>}
                </span>
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  <span className="material-symbols-outlined text-[12px] text-primary">package_2</span>
                  {pkgCount} packages
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topology strip */}
      <div className="rounded-xl bg-surface-subtle border border-border-hairline p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-label-code-sm text-text-muted uppercase tracking-wider">
            Dependency Execution Topology
          </span>
          <span className="text-body-sm text-text-secondary">
            Resolver verifies package dependency graph before generation.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card text-label-code-sm text-success border border-success/20">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            0 Circular Links
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card text-label-code-sm text-primary border border-border-hairline">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            100% Deterministic
          </span>
        </div>
      </div>
    </section>
  );
}
