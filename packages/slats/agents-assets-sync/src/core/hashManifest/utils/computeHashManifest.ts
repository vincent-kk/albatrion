import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';

import { type Sha256Hex, hashContent } from '../../hash/index.js';
import { toPosix } from '../../utils/toPosix.js';
import { walkFiles } from '../../utils/walkFiles.js';
import type { HashManifest, HashManifestSource } from '../type.js';
import { sortManifestFiles } from './sortManifestFiles.js';

// Kept byte-identical to the list in `scripts/buildHashes.mjs`. The ban runs
// one way — that script may not import from `src/`, because it must stay pure
// Node ESM for rolldown — so a shared home would have to live under `scripts/`
// with a hand-written `.d.mts`, the arrangement whose declaration drifted once
// already. Until that trade is taken, `__tests__/computeHashManifest.spec.ts`
// is what pins the two copies to the same output.
const NOISE = [/(^|\/)\.omc(\/|$)/, /(^|\/)\.DS_Store$/, /\.log$/];

/**
 * Hash an asset directory into an in-memory manifest.
 *
 * Produces the same document `scripts/buildHashes.mjs` writes for the same
 * tree, so a target resolved through `--asset-path` needs no build output:
 * same noise filter, same POSIX keys, same lexicographic key order.
 *
 * @param source - the package identity plus the asset root to hash;
 *   `assetRoot` is absolute and `assetPath` is it relative to `packageRoot`
 * @param generatedAt - ISO timestamp recorded in the manifest
 * @returns the manifest; `files` is empty when `assetRoot` does not exist
 */
export async function computeHashManifest(
  source: Pick<
    HashManifestSource,
    'name' | 'version' | 'assetRoot' | 'assetPath'
  >,
  generatedAt: string,
): Promise<HashManifest> {
  const files: Record<string, Sha256Hex> = {};
  for await (const abs of walkFiles(source.assetRoot)) {
    const relPath = toPosix(relative(source.assetRoot, abs));
    if (NOISE.some((pattern) => pattern.test(relPath))) continue;
    files[relPath] = hashContent(await readFile(abs));
  }
  return {
    schemaVersion: 1,
    package: { name: source.name, version: source.version },
    generatedAt,
    algorithm: 'sha256',
    assetRoot: source.assetPath,
    files: sortManifestFiles(files),
    previousVersions: {},
  };
}
