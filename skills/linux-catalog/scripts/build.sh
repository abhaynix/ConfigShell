#!/usr/bin/env sh
set -eu
repo=${1:-.}
cd "$repo"
test -f pnpm-workspace.yaml || { echo "Pass the ConfigShell repository root (pnpm-workspace.yaml was not found)." >&2; exit 1; }
pnpm build
