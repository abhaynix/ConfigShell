# Development

## Requirements

- Node.js 20 or newer; .nvmrc selects Node 22, which is covered by CI.
- pnpm 12.3.4, selected by Corepack from the root package.json.

```sh
corepack enable
nvm use
pnpm install
```

## Run the project

```sh
pnpm dev
```

This starts Vite on port 5173 and the API on port 3000. Vite proxies /api to the API.
The browser app needs no environment variables. For server configuration, copy
apps/server/.env.example to apps/server/.env and edit only the documented values.

Useful alternatives:

| Command | What it does |
| --- | --- |
| pnpm --filter web dev | Run only Vite on port 5173 |
| pnpm --filter server dev | Run the API with watch mode on port 3000 |
| pnpm --filter server start | Run the API once |
| pnpm mcp | Run the local stdio MCP server |
| pnpm build | Build the web app into apps/web/dist |
| pnpm start | Start the API and serve the built web app |

The server generates plans and validates requests; it does not execute commands. The MCP
server is read-only. See [the security model](security-model.md).

## Checks

pnpm check runs the full local gate: lint, typecheck, tests, and build. The same root scripts
are orchestrated by Turborepo in CI.

| Command | Purpose |
| --- | --- |
| pnpm lint | ESLint across workspace packages |
| pnpm typecheck | Strict TypeScript checks |
| pnpm test | Node test suites across the workspaces |
| pnpm build | Production web build |
| pnpm clean | Remove workspace build output |
| pnpm format | Apply the configured Prettier style |

Use workspace filters to run an individual package's lint, typecheck, or test script.
Source-only packages do not have standalone dev servers or emitted build steps.

## Project structure

- apps/: web and server applications.
- packages/: catalog, deterministic installer core, MCP adapter, shared assets, and test helpers.
- tests/contract/: HTTP and MCP contract tests.
- tooling/scripts/: repository automation.
- infra/docker/: the single Dockerfile and Compose configuration.
- skills/: the reusable Linux catalog skill.
- docs/: architecture, catalog, development, testing and deployment references.

The root workspace patterns are in pnpm-workspace.yaml; Turbo tasks are in turbo.json.
