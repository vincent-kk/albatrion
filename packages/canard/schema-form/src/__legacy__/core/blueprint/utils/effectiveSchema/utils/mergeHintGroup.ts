import { hasOwnProperty } from '@winglet/common-utils/lib';
import { merge } from '@winglet/common-utils/object';

/**
 * Merge a renderer hint group through shared immutable copy-on-write policies.
 * @param earlier - Earlier group or undefined.
 * @param later - Later group whose undefined children must not erase values.
 * @param omitVirtual - Whether options.virtual declarations must be excluded.
 * @param isAtomic - Optional renderer-supplied opaque-value predicate.
 * @returns A shared singleton/replacement or a newly merged group; inputs stay intact.
 */
export const mergeHintGroup = (
  earlier: unknown,
  later: unknown,
  omitVirtual: boolean,
  isAtomic?: (value: unknown) => boolean,
): unknown => {
  const source =
    omitVirtual &&
    later &&
    typeof later === 'object' &&
    hasOwnProperty(later, 'virtual')
      ? Object.fromEntries(
          Object.entries(later).filter(([key]) => key !== 'virtual'),
        )
      : later;
  if (source === undefined) return earlier;
  if (earlier === undefined) return source;
  if (
    !earlier ||
    !source ||
    typeof earlier !== 'object' ||
    typeof source !== 'object'
  )
    return source;
  return merge(earlier, source, {
    immutable: true,
    preserveReferences: true,
    arrayStrategy: 'replace',
    isAtomic,
  });
};
