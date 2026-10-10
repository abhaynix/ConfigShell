# Catalog reference

The source of truth is `packages/catalog/src/`. Read `docs/catalog.md` before changing catalog data.

## Supported target distributions

| Distribution | Native ecosystem |
| --- | --- |
| Ubuntu | apt |
| Fedora | dnf |
| Arch Linux | pacman |
| openSUSE | zypper |

The resolver currently selects by distribution, not release version. The web UI does not ask for a release.

## Presets

The curated presets are General, Student, Developer, Web Developer, DevOps, Data & AI, Content Creator and Gaming. Their stable IDs and application selections are defined in `packages/catalog/src/roles.ts`. Selecting a preset adds its recommended applications; users can change the selection afterward.

## Application data shape

The TypeScript interface is `Application` in `packages/catalog/src/types.ts`:

- `id`: stable, unique lowercase slug
- `name`, `description`, `category`, `homepage`
- `installation`: verified sources, each with `method`, `identifier`, `origin`, and optional supported `distros` and `url`
- optional `verify.binary`, `popularity`, `featured`

Valid categories and installation method values are defined alongside the type. A missing verified source is allowed. Never guess identifiers, record version numbers, or put command strings in catalog entries. See `docs/catalog.md` and the catalog validator for exact rules.

## Boundaries

- Application metadata and lookup live in `packages/catalog`.
- Environment creation and parsing live in `packages/catalog/src/environment.ts`.
- Resolution and command rendering belong to `packages/installer`.
- The browser and API do not execute commands. No local agent is implemented.
