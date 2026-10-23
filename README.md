# ConfigShell

[![CI](https://github.com/AbhiDevepl/configshell/actions/workflows/ci.yml/badge.svg)](https://github.com/AbhiDevepl/configshell/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Discover Linux applications and build a setup plan from a verified catalog. ConfigShell shows
the commands for you to review and run; it does not install software or execute shell commands.

## Quick start

Requires Node.js 20 or newer and pnpm 12.3.4 (Corepack uses the version pinned in package.json).

```sh
pnpm install
pnpm dev
pnpm check
```

Open [http://localhost:5173](http://localhost:5173). The API runs on port 3000.

## Repository map

| Path | Purpose |
| --- | --- |
| apps/web | Vite and React application |
| apps/server | Read-only planning API |
| packages/catalog | Verified application catalog and environment model |
| packages/installer | Deterministic resolution and command generation |
| packages/mcp | Read-only MCP server |
| packages/assets | Canonical logos and design tokens |
| packages/testing | Shared architecture test helpers |
| tests/contract | HTTP and MCP contract tests |
| skills/linux-catalog | Reusable catalog skill |
| tooling/scripts | Repository automation |
| infra/docker | Dockerfile and Compose definition |
| docs | Product, development, architecture and deployment docs |

Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started, or browse the [documentation index](docs/README.md).
New contributors can start with [good first issues](.github/GOOD_FIRST_ISSUES.md).

## Current scope

The web app supports distribution selection, presets, catalog search and filtering, application
details, selection, setup-plan generation, and command review. The API and MCP server are read-only.
A local agent, AI planning, and system-changing operations are future work.

See [the architecture](docs/architecture.md), [security model](docs/security-model.md), and
[roadmap](docs/ROADMAP.md) for details.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
