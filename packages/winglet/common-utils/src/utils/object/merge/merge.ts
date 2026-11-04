import type { MergeOptions } from './type';
import { mergeDefault } from './utils/mergeDefault';
import { mergeWithOptions } from './utils/mergeWithOptions';

/**
 * Select a deep-merge policy once before entering its recursive implementation.
 * @param target - Earlier container; mutated unless options.immutable is true
 * @param source - Later container, never mutated; undefined does not erase values
 * @param options - Array, atomicity, reference and mutation policies; omission uses defaults
 * @returns The mutated target by default, or copies/replacement values under options
 */
export const merge = <
  Target extends Record<PropertyKey, any>,
  Source extends Record<PropertyKey, any>,
>(
  target: Target,
  source: Source,
  options?: MergeOptions,
): Target & Source =>
  options === undefined
    ? mergeDefault(target, source)
    : mergeWithOptions(
        target,
        source,
        options,
        options.arrayStrategy === 'replace',
      );
