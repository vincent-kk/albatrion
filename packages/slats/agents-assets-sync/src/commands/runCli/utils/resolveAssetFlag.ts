import type { AssetKind } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';

const ALL_KINDS: readonly AssetKind[] = ['skills', 'rules', 'commands'];

/**
 * Validate `--asset` values into the kinds to inject.
 *
 * An empty flag means every kind. A narrowed set is not merely cosmetic: a
 * kind left out is absent from the plan entirely, so the run cannot report —
 * or delete — anything belonging to it.
 *
 * @param values - raw `--asset` values, already comma-split by the collector
 * @returns the kinds to inject; every kind when nothing was passed
 */
export function resolveAssetFlag(values: readonly string[]): Set<AssetKind> {
  if (values.length === 0) return new Set(ALL_KINDS);
  const kinds = new Set<AssetKind>();
  for (const value of values) {
    if (!ALL_KINDS.includes(value as AssetKind)) {
      logger.error(
        `Invalid --asset: ${value}. Expected ${ALL_KINDS.join(' | ')}.`,
      );
      process.exit(2);
    }
    kinds.add(value as AssetKind);
  }
  return kinds;
}
