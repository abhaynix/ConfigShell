# @configshell/test-utils

Shared helpers used by repository safety and architecture tests. This package is test-only and
is never included in the runtime app.

- Public API: source-file discovery and comment stripping from src/index.ts.
- Commands: pnpm --filter @configshell/test-utils test, typecheck, lint.
- Architecture checks read workspace manifests and verify dependency direction and command-syntax boundaries.
