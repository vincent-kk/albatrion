import path from 'node:path';

import {
  type LegacyVersion,
  loadDistEngine,
  loadLegacyEngine,
} from '../../../../canard/schema-form/bench/distEngine/loadDistEngine';

/**
 * Exposes the existing core factory from each installed bundle without rewriting its implementation.
 * @param version - `latest` for the workspace dist, otherwise an installed legacy alias
 * @returns The tree factory and the sha256 of the loaded bundle
 */
export async function loadCoreBenchmark(version: 'latest' | LegacyVersion) {
  if (version === 'latest') {
    const { create, distSha256 } = await loadDistEngine(
      path.resolve('results/.core'),
    );
    return { create, digest: distSha256 };
  }
  const { create, legacySha256 } = await loadLegacyEngine(
    path.resolve('results/.core'),
    version,
  );
  return { create, digest: legacySha256 };
}
