# ADR 0001: Monorepo layout

- Status: Accepted
- Date: 2026-10-10

## Decision

Keep applications in apps/, reusable product libraries and canonical assets in packages/, cross-workspace tests in tests/, repository scripts in tooling/, and infrastructure definitions in infra/. Community health documents live at the repository root; technical product documentation lives in docs/.

The root pnpm workspace and Turbo operate on these directories. Shared logos and design tokens have one source in packages/assets; generated web and skill copies are synchronized by tooling/scripts/sync-assets.ts.

## Rationale

This layout makes deployable apps, reusable code, tests, automation, and infrastructure easy to find without changing package names or runtime import paths. Root community files follow common hosting-platform discovery conventions. The existing product layers and security boundaries remain unchanged.

## Consequences

Moving a workspace requires updating its lockfile importer, scripts, documentation, tests, and container build inputs. Generated copies must not be edited directly.
