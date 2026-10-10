# ConfigShell Linux Catalog Skill

A beginner guide for running ConfigShell and using its real catalog-to-plan flow. It does not provide provisioning or automation features.

## Install

Unzip this package into your Codex skills directory so the folder is `~/.codex/skills/linux-catalog/`:

```sh
mkdir -p ~/.codex/skills
unzip -o linux-catalog.skill.zip -d ~/.codex/skills
```

Then restart or refresh Codex so it can discover `SKILL.md`.

## Quick start

From the ConfigShell repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter server dev
```

In a second terminal:

```sh
pnpm dev:web
```

Visit <http://localhost:5173>. Read `SKILL.md` for the walkthrough, build and production run instructions.

## Package contents

- `SKILL.md`: beginner workflow and project boundaries
- `scripts/`: setup, dev, build and run command helpers
- `assets/design-tokens.css`: design token reference copied from the app
- `assets/logos/`: local distribution and application logo assets used by the catalog
- `references/`: catalog model, real command reference, and logo sources/licensing
