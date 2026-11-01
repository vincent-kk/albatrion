import { isArray } from '@winglet/common-utils/filter';

/** Shared frozen result for a handler that returns no entries. */
const NO_ENTRIES: readonly (readonly [string, unknown])[] = Object.freeze([]);

/**
 * Preserve object insertion order or array pair order from a handler result.
 * @param result - Authored injection return value
 * @returns Valid path/value pairs, excluding malformed rows
 */
export const getInjectEntries = (
  result: unknown,
): readonly (readonly [string, unknown])[] => {
  if (result === null || result === undefined) return NO_ENTRIES;
  if (!isArray(result))
    return typeof result === 'object' ? Object.entries(result) : NO_ENTRIES;
  const entries: [string, unknown][] = [];
  for (const row of result)
    if (isArray(row) && typeof row[0] === 'string')
      entries.push([row[0], row[1]]);
  return entries;
};
