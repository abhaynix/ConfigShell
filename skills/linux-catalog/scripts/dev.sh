#!/usr/bin/env sh
set -eu
repo=${1:-.}
test -f "$repo/pnpm-workspace.yaml" || { echo "Pass the ConfigShell repository root (pnpm-workspace.yaml was not found)." >&2; exit 1; }
printf 'In terminal 1, run: cd %s && pnpm --filter server dev\n' "$repo"
printf 'In terminal 2, run: cd %s && pnpm dev:web\n' "$repo"
printf 'Then open http://localhost:5173\n'
