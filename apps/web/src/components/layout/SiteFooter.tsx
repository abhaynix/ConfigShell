import { PageContainer } from './PageContainer';

export function SiteFooter() {
  return (
    <footer className="border-t border-border-hairline py-8 text-body-sm text-text-secondary">
      <PageContainer className="flex flex-wrap items-center justify-between gap-4">
        <span>ConfigShell · Linux application catalog</span>
        <span>Plans are for review; ConfigShell does not install software.</span>
      </PageContainer>
    </footer>
  );
}
