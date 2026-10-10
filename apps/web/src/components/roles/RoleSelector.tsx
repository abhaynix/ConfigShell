import { cn } from '@/lib/utils';
import { ROLES, applicationsForRole, type Role } from '@configshell/catalog';
import { SectionHeading } from '@/components/layout/SectionHeading';
import type { CategoryId } from '@configshell/catalog';
import { CATEGORY_ICON, CATEGORY_NAME, CATEGORY_ID } from '@/components/applications/categoryIcon';

interface RoleSelectorProps {
  appliedRoleId: string | null;
  onApply: (role: Role) => void;
  onClear: () => void;
}

export function RoleSelector({ appliedRoleId, onApply, onClear }: RoleSelectorProps) {
  return (
    <section aria-labelledby="role-heading" className="page-section flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="role-heading"
          eyebrow="Optional · Step 2"
          title="Start with a preset"
          description="Start with a curated app set and adjust it to fit your needs."
        />
        {appliedRoleId && <button type="button" onClick={onClear} className="secondary-button">Clear selection</button>}
      </div>
      <div className="role-grid">
        {ROLES.map((role) => {
          const applied = appliedRoleId === role.id;
          const recommended = applicationsForRole(role, 'recommended');
          const roleId = role.id as CategoryId;
          const category = CATEGORY_NAME[roleId];
          const Icon = CATEGORY_ICON[category];
          return (
            <button
              key={role.id}
              type="button"
              aria-pressed={applied}
              onClick={() => onApply(role)}
              data-category={CATEGORY_ID[category]}
              className={cn('role-card text-left', applied && 'is-selected')}
            >
              <span className="role-card__icon" aria-hidden="true"><Icon className="h-6 w-6" /></span>
              <span className="role-card__title">{role.name}</span>
              <span className="role-card__description">{role.description}</span>
              <span className="role-card__tags" aria-label="Recommended applications">
                {recommended.slice(0, 3).map((app) => <span key={app.id} className="role-card__tag">{app.name}</span>)}
              </span>
              <span className="role-card__footer">{recommended.length} recommended applications</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
