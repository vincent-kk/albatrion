import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { JSONArray, JSONObject } from '@/json/type';

/**
 * Decides whether an object member read through `getDataProperty` is absent as JSON data.
 *
 * JSON values are never `undefined` or functions, and every native inherited member of a
 * plain object is a function, so only those two read results need the own-property check.
 * Skipping it otherwise matters: the check is slow on objects whose members were deleted.
 * A non-function value that other code has added to `Object.prototype` is not detected.
 *
 * @param object - The container the member was read from
 * @param key - The member name that was read
 * @param current - The value `getDataProperty(object, key)` returned
 * @returns true when the member is not an own data member of `object`
 */
export const isMissingMember = (
  object: JSONObject | JSONArray,
  key: string,
  current: unknown,
): boolean =>
  (current === undefined || typeof current === 'function') &&
  !hasOwnProperty(object, key);
