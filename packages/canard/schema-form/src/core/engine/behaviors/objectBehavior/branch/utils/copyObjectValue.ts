import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

/** V8 keeps at most 1,020 fast properties; larger objects are dictionaries, which a spread copies faster. */
const FAST_PROPERTY_LIMIT = 1020;

/**
 * Copy a plain object value with the same own keys, order and values.
 * A spread site shared by every object node turns megamorphic in V8 and copies key by key;
 * `Object.assign` keeps the clone fast path, and JavaScriptCore copies both at the same cost.
 * @param source - Plain data object; an own `__proto__` key stays a data property
 * @param keyCount - Number of own keys in `source`
 * @returns A new ordinary object holding the source's own enumerable properties
 */
export const copyObjectValue = (
  source: object,
  keyCount: number,
): Dictionary<unknown> => {
  if (keyCount > FAST_PROPERTY_LIMIT || hasOwnProperty(source, '__proto__'))
    return { ...source };
  const copy: Dictionary<unknown> = {};
  return Object.assign(copy, source);
};
