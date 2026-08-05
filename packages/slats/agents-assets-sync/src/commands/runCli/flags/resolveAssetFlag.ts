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
  const parsed = parseAssetFlag(values);
  if ('error' in parsed) {
    for (const line of parsed.error) logger.error(line);
    process.exit(2);
  }
  return parsed.kinds;
}

/**
 * Same validation as `resolveAssetFlag`, reporting instead of exiting.
 *
 * @param values - raw `--asset` values
 * @returns the kinds, or the message lines describing why there are none
 */
export function parseAssetFlag(
  values: readonly string[],
): { kinds: Set<AssetKind> } | { error: string[] } {
  if (values.length === 0) return { kinds: new Set(ALL_KINDS) };
  const kinds = new Set<AssetKind>();
  for (const value of values) {
    if (!ALL_KINDS.includes(value as AssetKind))
      return {
        error: [`Invalid --asset: ${value}. Expected ${ALL_KINDS.join(' | ')}.`],
      };
    kinds.add(value as AssetKind);
  }
  return { kinds };
}
