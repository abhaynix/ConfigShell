---
name: linux-catalog
description: Help beginners explore ConfigShell's verified Linux application catalog and generate a reviewable setup plan.
---

# ConfigShell Linux Catalog

Use this skill to run the ConfigShell web app, choose a Linux distribution, browse its verified application catalog, and review a setup plan.

## What the project does today

ConfigShell contains a catalog of verified application sources. You choose Ubuntu, Fedora, Arch Linux, or openSUSE, optionally choose a role preset, and select applications. The deterministic planner resolves catalog entries for that target and shows commands, manual steps, or unavailable explanations. You can review and copy generated commands.

ConfigShell does **not** install software. The browser never executes commands. Run any command yourself only after reviewing it. System detection by a trusted local agent is coming soon; the web app only reports a browser OS hint.

## Beginner setup

You need Node.js 20 or newer and pnpm 12.3.4. Open a terminal in the ConfigShell repository root (the folder containing `pnpm-workspace.yaml`). Run:

```sh
pnpm install --frozen-lockfile
```

Or run `scripts/setup.sh /path/to/ConfigShell` from this skill folder.

## Start the app

Terminal 1, start the API:

```sh
pnpm --filter server dev
```

Terminal 2, start the web app:

```sh
pnpm dev:web
```

Then open <http://localhost:5173>. The web app proxies API requests to port 3000. The setup-plan view needs the API running.

Use `scripts/dev.sh /path/to/ConfigShell` to print the two commands.

## Create and review a setup plan

1. Choose Linux and one of the supported distributions and releases.
2. Optionally select a role preset. Presets are curated selections, not system profiles.
3. Browse or search the catalog. Select applications you want.
4. Open **Review setup plan**.
5. Read each resolved command and every manual or unavailable explanation. Copy only commands you have reviewed. ConfigShell does not run them.

## Build and run

Build the web app:

```sh
pnpm build
```

Start the production server (serves the API and built web app):

```sh
pnpm start
```

`scripts/build.sh` and `scripts/run.sh` wrap these real repository commands.

## Catalog editing

Application metadata is owned by `packages/catalog`. Read `docs/catalog.md` first; only add identifiers verified by an authoritative source. The catalog records source identifiers, not package-manager commands or version numbers. Do not guess package names. The catalog validator and tests must pass after data changes.

Supported distributions and ecosystem mappings live in `packages/catalog/src/types.ts`; environment creation and parsing live in `packages/catalog/src/environment.ts`. Changes to resolver policy belong in `packages/installer`, not the web app.

## Design reference

`assets/design-tokens.css` is generated from `packages/assets/design-tokens.css` by `pnpm assets:sync`. Use it as a visual reference; it is not a separate runtime dependency. See `references/catalog-model.md` and `references/real-commands.md` for the verified project structure and commands.

## Troubleshooting

- If the page loads but the plan does not, confirm both development servers are running: the API on port 3000 and the web app on port 5173.
- If the API is on a different address, see `apps/web/.env.example` and `docs/development.md` before changing configuration.
- If an app resolves to a manual or unavailable result, read the explanation in the plan. The catalog only includes verified sources; it does not guess.
- If a command is not appropriate for your computer, do not run it. ConfigShell does not inspect the full host or execute commands for you.

## Important limits

There is no Ansible/Bash provisioning generator, no release-version input, and no system-changing local agent in this repository today. The plan is a reviewable list of generated commands and explanations. Do not treat the command list as a script or run it without reviewing each command.
