import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { hashDistribution } from './hashDistribution.mjs';

/**
 * Load the published object subpath with native Node loaders and no transformation.
 * @param packageRoot - Frozen copy of an actual common-utils runtime build.
 * @returns ESM/CJS public merge functions, manifest entry paths and artifact hashes.
 */
export const loadMergeDistribution = async (packageRoot) => {
  const root = resolve(packageRoot);
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );
  const exported = manifest.exports['./object'];
  const entries = {
    esm: resolve(root, exported.import),
    cjs: resolve(root, exported.require),
  };
  for (const path of Object.values(entries))
    if (!path.startsWith(resolve(root, 'dist') + sep))
      throw new Error(`Non-distribution entry rejected: ${path}`);
  const hashes = hashDistribution(root);
  const esm = await import(pathToFileURL(entries.esm).href);
  const cjs = createRequire(import.meta.url)(entries.cjs);
  if (typeof esm.merge !== 'function' || typeof cjs.merge !== 'function')
    throw new Error('Public object subpath must expose merge in both formats');
  return {
    root,
    entries,
    hashes,
    esm: esm.merge,
    cjs: cjs.merge,
    version: manifest.version,
  };
};
