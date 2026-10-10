import { cn } from '@/lib/utils';
import type { Application } from '@configshell/catalog';
import { CATEGORY_ICON } from './categoryIcon';
import { CATEGORY_ID } from './categoryIcon';
import { APP_LOGOS } from './brandLogos';
import { LogoTile } from '@/components/ui/LogoTile';

interface AppCardProps {
  app: Application;
  selected: boolean;
  onToggle: (id: string) => void;
  onOpenDetails: (app: Application) => void;
}

export function AppCard({ app, selected, onToggle, onOpenDetails }: AppCardProps) {
  const Icon = CATEGORY_ICON[app.category];
  const logo = APP_LOGOS[app.id];

  return (
    <article className={cn('app-card group', selected && 'is-selected')} data-category={CATEGORY_ID[app.category]}>
      <button
        type="button"
        className="app-card__open"
        aria-label={`Details for ${app.name}`}
        onClick={() => onOpenDetails(app)}
      />
      <div className="app-card__header">
        <LogoTile src={logo?.src} name={app.name} category={CATEGORY_ID[app.category]} lightTile={logo?.lightTile} />
      </div>
      <div className="app-card__main">
        <h3>{app.name}</h3>
        <p className="app-card__category"><Icon className="category-icon" aria-hidden="true" />{app.category}</p>
        <p className="app-card__description">{app.description}</p>
      </div>
      <div className="app-card__footer">
        <button type="button" aria-pressed={selected} onClick={() => onToggle(app.id)} className={cn('app-card__toggle', selected && 'is-selected')}>
          {selected ? 'Remove from plan' : 'Add to plan'}
        </button>
      </div>
    </article>
  );
}
