# UI redesign verification

- Routes: `/` and `/connect`.
- Responsive viewport sweep: 320, 375, 414, 768, 844x390 landscape, 1024, 1280, 1440, 1920 and 2560 CSS pixels. No horizontal overflow, sibling text overlap, unequal card rows, undersized controls, or navigation overflow was found.
- Keyboard: opened the mobile navigation from the keyboard; verified focus trap with Shift+Tab, Escape close, body scroll lock and focus return.
- Catalog render sample at 1280px: all 160 application cards were present; a measured geometry read took 0.2ms. No pagination or virtualization was added.
- Production Lighthouse desktop: Performance 90, Accessibility 100, Best Practices 100, SEO 100. CLS 0, TBT 20ms.
- Build emits a Vite advisory for the 510.79KB minified entry chunk; it is 156.85KB gzip.
