import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { CoreWeights } from '../reportTypes';

/** Weight table shipped with the package. */
const DEFAULT_PATH = fileURLToPath(
  new URL('../../../fixtures/core-weights.json', import.meta.url),
);

/**
 * Read and validate the weight table at the runner boundary.
 * @param path - Weight table file; defaults to fixtures/core-weights.json.
 * @returns The table; throws when an entry lacks a positive weight, a positive k or a basis.
 */
export function readCoreWeights(path = DEFAULT_PATH): CoreWeights {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
    throw new Error('Core weights must be an object keyed by case id');
  const weights: CoreWeights = {};
  for (const [id, entry] of Object.entries(parsed)) {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !('weight' in entry) ||
      !('k' in entry) ||
      !('basis' in entry) ||
      typeof entry.weight !== 'number' ||
      entry.weight <= 0 ||
      typeof entry.k !== 'number' ||
      entry.k <= 0 ||
      typeof entry.basis !== 'string' ||
      !entry.basis
    )
      throw new Error(`Core weight entry is invalid: ${id}`);
    const excluded = 'excluded' in entry ? entry.excluded : undefined;
    if (excluded !== undefined && typeof excluded !== 'string')
      throw new Error(`Core weight exclusion must be a string: ${id}`);
    weights[id] = {
      weight: entry.weight,
      k: entry.k,
      basis: entry.basis,
      ...(excluded === undefined ? {} : { excluded }),
    };
  }
  return weights;
}
