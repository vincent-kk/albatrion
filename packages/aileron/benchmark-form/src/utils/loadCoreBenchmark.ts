import path from 'node:path';

import {
  loadDistEngine,
  loadLegacyEngine,
} from '../../../../canard/schema-form/bench/distEngine/loadDistEngine';

/** Exposes the existing core factory from each installed bundle without rewriting its implementation. */
export async function loadCoreBenchmark(version: string) {
  if (version === 'latest') {
    const { create, distSha256 } = await loadDistEngine(
      path.resolve('results/.core'),
    );
    return { create, digest: distSha256 };
  }
  const { create, legacySha256 } = await loadLegacyEngine(
    path.resolve('results/.core'),
  );
  return { create, digest: legacySha256 };
}
