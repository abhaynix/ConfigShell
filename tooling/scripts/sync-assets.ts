import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(repoRoot, 'packages/assets');

async function sync(from: string, to: string) {
  await rm(to, { recursive: true, force: true });
  await mkdir(dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
}

await Promise.all([
  sync(resolve(source, 'logos'), resolve(repoRoot, 'apps/web/public/logos')),
  sync(resolve(source, 'logos'), resolve(repoRoot, 'skills/linux-catalog/assets/logos')),
  sync(resolve(source, 'design-tokens.css'), resolve(repoRoot, 'apps/web/src/design-tokens.css')),
  sync(resolve(source, 'design-tokens.css'), resolve(repoRoot, 'skills/linux-catalog/assets/design-tokens.css')),
]);
