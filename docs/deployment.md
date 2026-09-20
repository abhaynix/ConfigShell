# Deployment

ConfigShell deploys as **one container**. There is one `Dockerfile` in the
repository, and every platform runs that same image.

```
GitHub repository
      ↓
  Dockerfile            one build definition, no platform-specific logic
      ↓
  container image
      ↓
  any container platform      Docker · a VPS · Render · Railway · Fly · Vercel
```

- [What is in the container](#what-is-in-the-container)
- [Option A — run it with Docker](#option-a--run-it-with-docker)
- [Option B — deploy to a container platform](#option-b--deploy-to-a-container-platform)
- [Configuration](#configuration)
- [Verifying MCP after deploying](#verifying-mcp-after-deploying)
- [Security model in the container](#security-model-in-the-container)
- [Validating a change](#validating-a-change)

## What is in the container

One Express process (`apps/server`) already serves every surface, so the image
packages exactly that — it does not add a topology of its own:

| Path | What it serves |
| ---- | -------------- |
| `/` | the built web app (`apps/web/dist`, static) |
| `/api/*` | the read-only planning API |
| `/mcp` | the MCP server over Streamable HTTP (path = `MCP_PATH`) |
| `/health` | liveness plus catalog integrity |

There is **no second container**. The MCP endpoint shares the catalog, the
resolver and the process with the API; splitting it out would double the deploy
surface and gain nothing. The stdio MCP transport is a local developer tool
(`pnpm mcp`), not a deployed service.

The container:

- builds reproducibly from the lockfile (`pnpm install --frozen-lockfile`),
- runs as the unprivileged `node` user — never root,
- binds `0.0.0.0` on `$PORT`,
- handles `SIGTERM` itself and closes the listener before exiting,
- keeps no state: no database, no volumes, no sessions. Any instance can serve
  any request, so it scales horizontally with no coordination.

## Option A — run it with Docker

```sh
docker compose up -d          # http://localhost:3000
```

`compose.yml` is a convenience wrapper around the same `Dockerfile`: it adds
the hardening flags a bare `docker run` would need spelled out (read-only root
filesystem, all capabilities dropped, `no-new-privileges`). Publish on a
different host port with `API_PORT=8080 docker compose up -d`.

Without Compose:

```sh
docker build -t configshell .
docker run --rm -p 3000:3000 -e PUBLIC_BASE_URL=http://localhost:3000 configshell
```

## Option B — deploy to a container platform

Point the platform at this repository. Most detect the root `Dockerfile` with
no configuration at all — Render, Railway, Fly and a plain VPS all do — and the
only thing that usually needs setting is `PUBLIC_BASE_URL`.

Platforms supply `$PORT` themselves; the server reads it. Do not hardcode one.

### Vercel

Vercel's zero-config detection looks for `Dockerfile.vercel` and no other
filename. Rather than keep a second Dockerfile, **`vercel.json` points Vercel at
the canonical one**:

```json
{
  "services": {
    "configshell": { "runtime": "container", "root": ".", "entrypoint": "Dockerfile" }
  },
  "rewrites": [{ "source": "/(.*)", "destination": { "service": "configshell" } }]
}
```

One build definition, no duplicate to drift.

Both [Container Images](https://vercel.com/docs/functions/container-images) and
[Services](https://vercel.com/docs/services) are **beta** and gated per account;
a deploy fails with a permissions error if either is not enabled for the team.
If the `services` route is unavailable, the fallback that still avoids a second
definition is a `Dockerfile.vercel` **symlink** to `Dockerfile` — git stores it
as a symlink and restores it on checkout. Do not add a real second Dockerfile.

Two project settings are required, beyond `PUBLIC_BASE_URL`:

| Setting | Value | Why |
| ------- | ----- | --- |
| `PORT` | `3000` | Vercel routes to port **80** unless the project sets `PORT`. The image binds 3000 on purpose — binding a privileged port would mean granting this process a capability it must never hold. Without this, requests never reach the container. |
| Deployment Protection | off for production | With Vercel Authentication enabled the deployment answers unauthenticated callers with an SSO challenge. An external MCP host is an unauthenticated, server-to-server caller with no browser and cannot pass it. |

## Configuration

Every variable has a working default; the container runs with none of them set.

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `PUBLIC_BASE_URL` | `http://localhost:$PORT` | **The one that usually matters.** The public origin this deployment is reachable at. The public MCP URL is derived from it as `PUBLIC_BASE_URL + MCP_PATH`. Must be `https` unless it is a localhost origin. Nothing routes on it, so a wrong value misreports that URL rather than breaking the server. |
| `PORT` | `3000` | Port the server binds. Hosting platforms set this themselves. |
| `MCP_PATH` | `/mcp` | Where the MCP endpoint is mounted. Cannot collide with `/api` or `/health`. |
| `NODE_ENV` | `production` in the image | `development` / `test` / `production`. |
| `API_PORT` | `3000` | Docker Compose only: the *host* port the stack is published on. |

Changing the public domain is an environment change and nothing else. No domain
appears anywhere in application source, and `PUBLIC_BASE_URL` is deliberately
**not** defaulted from a platform variable such as `VERCEL_URL`: that value
changes with every deployment, so a user who pasted it into an AI host would
find their connector broken by the next push.

There are **no secrets to configure** — no AI key, no database URL, no auth
token. `.env` files are git-ignored and `.dockerignore` keeps them out of the
build context.

## Verifying MCP after deploying

An HTTP 200 from `/` proves nothing about MCP: the website, the API and the MCP
endpoint are three surfaces of one process and only one speaks the protocol.

```sh
curl -sS -X POST "$PUBLIC_BASE_URL/mcp" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{
        "protocolVersion":"2025-11-25","capabilities":{},
        "clientInfo":{"name":"probe","version":"0"}}}'
```

A working endpoint answers `serverInfo.name: "configshell"`. The response is an
SSE frame (`event: message`) — that is the Streamable HTTP transport behaving
correctly, not an error.

The check worth trusting is the **official MCP client** against the deployed
URL, compared with stdio. See
[`mcp.md`](mcp.md#verifying-a-remote-deployment).

## Security model in the container

The container enforces the repository's existing principles rather than adding
new ones:

- **Never in a position to execute.** The server generates installation
  commands as *text* and must never run one. It runs as the unprivileged `node`
  user, all capabilities are dropped, and `no-new-privileges` is set.
- **No remote sudo.** Execution belongs to the future local agent
  (`docs/agent.md`); nothing in the image invokes a package manager.
- **No secrets in the image.** `.dockerignore` keeps `.env` and key files out of
  the build context, and there are none to configure anyway.
- **Bounded input.** Express caps request bodies at 16 kB.
- **Small blast radius.** One published port, no host mounts. The catalog is
  read-only data compiled into the image.

Compose also runs a read-only root filesystem. That is a hardening toggle, not
a product requirement — remove `read_only: true` if an operator needs to.

### Base image

`node:24.21-alpine`, pinned to a Node minor rather than a floating `24` tag so
the vulnerability posture is reproducible. Node 24 is the active LTS and the
version Vercel names as the migration target now that Node 20 is disabled in
project settings from 2026-10-01; because this deploys as a container, the pin
here — not any platform default — is what the process runs.

A `trivy`-style scan reports only findings in the base image's bundled `npm`,
which no ConfigShell runtime invokes (package management is pnpm via Corepack;
the entry points are `pnpm`/`tsx`). The dependency tree the container actually
loads is clean. Bump the pin in `Dockerfile` when a Node minor with fixes lands.

## Validating a change

The repository's own checks do not need Docker and run in CI:

```sh
pnpm install --frozen-lockfile
pnpm check                     # lint → typecheck → test → build
```

The container itself needs a daemon, so these are run by hand:

```sh
# 1 — the image builds
docker build -t configshell .

# 2 — it runs unprivileged with an exec-form entrypoint
docker image inspect configshell \
  --format '{{.Config.User}} {{.Config.Cmd}} {{.Config.WorkingDir}}'

# 3 — the whole product answers on one port
docker compose up -d
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:3000/                                   # SPA HTML
curl -fsS 'http://localhost:3000/api/applications/git?distro=Ubuntu'

# 4 — a real setup plan through the published surface
#     (distro values are capitalised exactly as the catalog spells them)
curl -fsS -X POST http://localhost:3000/api/plan \
  -H 'content-type: application/json' \
  -d '{"environment":{"distro":"Ubuntu"},"applicationIds":["git"]}'

# 5 — MCP answers on the same port
curl -fsS -X POST http://localhost:3000/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'

# 6 — $PORT is honoured, as a hosting platform would set it
docker run --rm -p 8080:8080 -e PORT=8080 configshell &
curl -fsS http://localhost:8080/health

# 7 — teardown
docker compose down
```

Stronger than any of the above, and the one to actually run before trusting a
deployment: point the **MCP Inspector** or the official MCP client at
`$PUBLIC_BASE_URL/mcp` — see [`mcp.md`](mcp.md#verifying-a-remote-deployment).

---

See also: `README.md` (product overview), `docs/architecture.md` (the system
this deploys), `docs/security-model.md` (why the container looks the way it
does), `docs/mcp.md` (the MCP surfaces), `docs/development.md` (local
development, which needs no Docker).
