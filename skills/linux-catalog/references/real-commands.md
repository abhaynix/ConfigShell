# ConfigShell commands verified in this repository

Run from the repository root. Requires Node.js >=20 and the pnpm version in `package.json`.

| Purpose | Command |
| --- | --- |
| Install dependencies | `pnpm install --frozen-lockfile` |
| Start API for development | `pnpm --filter server dev` |
| Start web development server | `pnpm dev:web` |
| Build web app | `pnpm build` |
| Start production API and built web app | `pnpm start` |

The development web server runs on port 5173 and proxies `/api` to the API on port 3000. `pnpm start` needs the web build from `pnpm build`.
