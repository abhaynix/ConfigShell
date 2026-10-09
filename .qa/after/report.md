# Layout pass report

| Route | Viewport | Before document width | After document width | After checks |
| --- | ---: | ---: | ---: | --- |
| `/` | 360px | 680px | 360px | Pass |
| `/` | 768px | 884px | 768px | Pass |
| `/` | 1024px | 1024px | 1024px | Pass |
| `/` | 1440px | 1440px | 1440px | Pass |
| `/` | 1920px | 1920px | 1920px | Pass |
| `/connect` | 360px | 360px | 360px | Pass |
| `/connect` | 768px | 768px | 768px | Pass |
| `/connect` | 1024px | 1024px | 1024px | Pass |
| `/connect` | 1440px | 1440px | 1440px | Pass |
| `/connect` | 1920px | 1920px | 1920px | Pass |

The after checks also cover header/card text overlap, card height equality by row, icon font loading and width, failed font requests, console errors, and 40px tap target heights at 360px. `pnpm qa:layout` passes all 10 combinations.

Baseline screenshots are in `../before/`; after screenshots are in this directory. The repository did not contain `.stitch-ref/`; available references are in `stitch-designs/`.

Remaining reference gap: the catalog's typed distro data contains five distributions. Rocky/RHEL and Alpine are absent. This fix-only pass did not add catalog data or distro support. A toast or popover over the Arch card was not reproducible.

The catalog currently has 160 cards, below the 200-card target; `content-visibility: auto` is enabled. Scroll performance was not benchmarked on an i7/16GB system.
