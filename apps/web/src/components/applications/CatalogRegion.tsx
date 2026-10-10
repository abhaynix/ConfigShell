import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import type { AppCatalogProps } from './AppCatalog';

const LazyCatalog = lazy(() => import('./AppCatalog').then(({ AppCatalog }) => ({ default: AppCatalog })));

interface BoundaryState { error: Error | null }

class CatalogErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Catalog failed to render:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <section className="catalog-state" role="alert">
          <h2>Could not load the application catalog</h2>
          <p>Try loading the catalog again. Your current selection has not been changed.</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>Retry</button>
        </section>
      );
    }
    return this.props.children;
  }
}

function CatalogSkeleton() {
  return (
    <section aria-label="Loading application catalog" aria-busy="true" className="catalog-skeleton-wrap">
      <div className="catalog-skeleton-heading">
        <span className="skeleton-line skeleton-line--short" />
        <span className="skeleton-line skeleton-line--title" />
        <span className="skeleton-line skeleton-line--description" />
      </div>
      <div className="catalog-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <article key={index} className="catalog-skeleton-card" aria-hidden="true">
            <span className="skeleton-block skeleton-block--icon" />
            <span className="skeleton-line skeleton-line--name" />
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-line skeleton-line--description" />
            <span className="skeleton-card-footer" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function CatalogRegion(props: AppCatalogProps) {
  return (
    <CatalogErrorBoundary>
      <Suspense fallback={<CatalogSkeleton />}>
        <LazyCatalog {...props} />
      </Suspense>
    </CatalogErrorBoundary>
  );
}
