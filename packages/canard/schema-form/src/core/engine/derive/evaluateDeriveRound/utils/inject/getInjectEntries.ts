import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

/**
 * Preserve object insertion order or array pair order from a handler result.
 * @param result - Authored injection return value
 * @returns Valid path/value pairs, excluding malformed rows
 */
export const getInjectEntries = (
  result: unknown,
): readonly (readonly [string, unknown])[] => {
  if (result === null || result === undefined) return EMPTY_ARRAY;
  if (!isArray(result))
    return typeof result === 'object' ? Object.entries(result) : EMPTY_ARRAY;
  const entries: [string, unknown][] = [];
  for (const row of result)
    if (isArray(row) && typeof row[0] === 'string')
      entries.push([row[0], row[1]]);
  return entries;
};
