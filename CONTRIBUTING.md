# Contributing

Thanks for helping improve ConfigShell. Start with the [Code of Conduct](CODE_OF_CONDUCT.md)
and look through [good first issues](.github/GOOD_FIRST_ISSUES.md).

## Prerequisites and setup

Install Node.js 20 or newer. Use Node 22 locally to match CI; the version is in .nvmrc.
Enable Corepack so it selects the pnpm version pinned in the root package.json.

```sh
corepack enable
nvm use
git clone https://github.com/<your-username>/configshell.git
cd configshell
pnpm install
```

If you do not use nvm, install Node 22 and run corepack prepare pnpm@12.3.4 --activate.

## Run and verify

```sh
pnpm dev       # web at http://localhost:5173 and API at http://localhost:3000
pnpm check     # lint, typecheck, tests and production build
```

Other useful commands: pnpm --filter web dev runs only the web app,
pnpm --filter server start runs the API, and pnpm mcp starts the local stdio MCP server.
The web app uses the API for planning; Vite proxies /api to port 3000.

## Add a catalog application

1. Read [the catalog rules](docs/catalog.md). Every package identifier must be verified from an
   authoritative source; do not guess identifiers or record version numbers.
2. Add or update the entry in packages/catalog/src/applications.ts. Keep its id, name,
   description, category, installation sources and optional verification binary accurate.
3. If an existing preset should include it, update packages/catalog/src/roles.ts; do not add
   an application to a role without checking that it exists in the catalog.
4. Update the source/count documentation in docs/catalog.md when the documented totals change.
5. Run pnpm --filter @configshell/catalog test, then pnpm check. Include the authoritative
   source links in your pull request.

## Branches and commits

Branch from the current default branch. Use a descriptive name such as
feature/catalog-add-inkscape, fix/web-empty-state, or docs/catalog-rules.

Use lightweight Conventional Commits: feat:, fix:, docs:, refactor:, test:, chore:, build:, or ci:.
Keep each pull request focused and explain why for changes whose intent is not clear from the diff.

## Pull request checklist

- [ ] pnpm check passes.
- [ ] Docs and changelog are updated where needed.
- [ ] Catalog identifiers include authoritative source links.
- [ ] UI changes include screenshots at relevant viewport sizes.
- [ ] No secrets, generated build output, or unsupported feature claims are included.

A pull request should describe the change, link the issue, and state what you verified. See the
[pull request template](.github/PULL_REQUEST_TEMPLATE.md).
