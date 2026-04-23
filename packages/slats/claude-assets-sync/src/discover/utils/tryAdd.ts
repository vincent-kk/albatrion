import { stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { ConsumerPackage, PkgJson } from '../type.js';

export async function tryAdd(
  found: Map<string, ConsumerPackage>,
  packageRoot: string,
  pkg: PkgJson,
): Promise<void> {
  const assetPath = pkg.claude?.assetPath;
  if (typeof assetPath !== 'string' || assetPath.length === 0) return;
  if (!pkg.name) return;
  if (found.has(pkg.name)) return;
  const assetRoot = resolve(packageRoot, assetPath);
  const hashesPath = join(packageRoot, 'dist', 'claude-hashes.json');
  const hashesPresent = await stat(hashesPath).then(
    () => true,
    () => false,
  );
  found.set(pkg.name, {
    name: pkg.name,
    version: pkg.version ?? 'unknown',
    packageRoot,
    assetRoot,
    hashesPresent,
  });
}
