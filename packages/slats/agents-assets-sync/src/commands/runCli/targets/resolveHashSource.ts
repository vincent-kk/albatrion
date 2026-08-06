import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { HASH_MANIFEST_FILENAME } from '../../../core/index.js';
import type { ConsumerPackage } from '../../../types/index.js';
import type { ResolvedMetadata } from './resolvePackage.js';

/**
 * Settle which source can answer for one target's hashes.
 *
 * `--asset-path` names the directory outright, so it wins unconditionally — a
 * stored manifest may describe a different tree than the flag pointed at. A
 * declared `agents.assetPath` prefers the built manifest and falls back to
 * hashing the declared directory: the declaration says where the assets are,
 * not that a build has run, so missing build output is a reason to look
 * elsewhere rather than to stop.
 *
 * With neither present the answer stays `manifest`, which is what
 * `needsBuiltManifest` refuses. Hashing an absent directory would succeed with
 * an empty manifest, and an empty manifest makes every already-installed file
 * an orphan — content `--force` then deletes.
 *
 * @param metadata - the resolved target, including which source named its asset path
 * @param assetRoot - the absolute asset root, already judged to be a directory
 *   or absent by `resolvePackage`
 * @returns the target's hash source and whether its manifest was found
 */
export async function resolveHashSource(
  metadata: ResolvedMetadata,
  assetRoot: string,
): Promise<Pick<ConsumerPackage, 'hashSource' | 'hashesPresent'>> {
  if (metadata.assetPathSource === 'flag')
    return { hashSource: 'directory', hashesPresent: false };

  const manifestPath = join(
    metadata.packageRoot,
    'dist',
    HASH_MANIFEST_FILENAME,
  );
  if (await exists(manifestPath))
    return { hashSource: 'manifest', hashesPresent: true };

  return {
    hashSource: (await exists(assetRoot)) ? 'directory' : 'manifest',
    hashesPresent: false,
  };
}

// `stat` follows links, so a symlinked asset root counts as present — the same
// resolution `resolvePackage` already judged for containment.
function exists(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false,
  );
}
