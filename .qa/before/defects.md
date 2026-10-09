# Before layout QA

Reference screenshots expected at `.stitch-ref/` were absent. The available visual references are in `stitch-designs/`.

Reproduced findings:

- `/` at 360px: `document.documentElement.scrollWidth` was 680px. The 1,000px `AmbientGlow`, long CLI distro tab row, role chip row, and text-rendered icons extended beyond the viewport. Screenshot: `home-360.png`.
- `/` at 768px: document width was 884px. Screenshot: `home-768.png`.
- `/` at all checked widths: `.material-symbols-outlined` had no loaded font face, so names such as `terminal`, `memory`, and `deployed_code` rendered as text. Screenshots: `home-{360,768,1024,1440,1920}.png`.
- `/` at 360px: the stepper bar covered the detection card and its explanatory text. Screenshot: `home-360.png`.
- `/` at 360px: interactive controls were shorter than the requested 40px minimum. Screenshot: `home-360.png`.
- `/connect` at all checked widths: no horizontal overflow was observed; its header controls were below the requested 40px target height at 360px. Screenshots: `connect-{360,768,1024,1440,1920}.png`.

Not reproduced in the available implementation: a toast or popover over the Arch card. The current distribution model has five cards (Ubuntu, Debian, Fedora, Arch Linux, and openSUSE); Rocky/RHEL and Alpine entries are absent and were not added because this brief prohibits data changes.
