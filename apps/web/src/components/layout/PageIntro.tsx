/**
 * The single page-level intro, above every section on the build view.
 *
 * One line explains what the page does; the second line sets the boundary the
 * rest of the screen keeps every time it is tempted to cross it, nothing
 * installs automatically.
 */
export function PageIntro() {
  return (
    <section aria-label="Page introduction" className="pt-3 pb-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Install the Linux apps you actually need.
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pick your distribution, choose applications, and get the exact commands. Nothing installs automatically.
        </p>
      </div>
    </section>
  );
}