import { isArray, isPlainObject } from '@winglet/common-utils/filter';
import type { ArrayValue, ObjectValue } from '@winglet/json-schema';

/**
 * Lays validation-only entries over a value without giving the value anything it does not hold.
 * An entry is written only into an object the value already has at that path, so an entry recorded for a node the value leaves out — an omitted object, a removed array item — is dropped instead of bringing that node back.
 * @param value - The value to validate; left untouched
 * @param enhancer - Entries to add, shaped like the value: a leaf is written, an object or array is followed
 * @returns A copy of `value` along the paths that received entries; `value` itself when there is nothing to write into
 */
export const applyEnhancer = (value: unknown, enhancer: unknown): unknown => {
  if (!isArray(enhancer) && !isPlainObject(enhancer)) return value;
  if (isArray(value)) return overlayArray(value, Object.entries(enhancer));
  if (isPlainObject(value))
    return overlayObject(value, Object.entries(enhancer));
  return value;
};

/** Copy of an object with each leaf entry written and each nested entry applied to the key the object holds. */
const overlayObject = (
  value: ObjectValue,
  entries: [key: string, entry: unknown][],
) => {
  const result = { ...value };
  for (const [key, entry] of entries)
    if (!isArray(entry) && !isPlainObject(entry)) result[key] = entry;
    else if (key in value) result[key] = applyEnhancer(value[key], entry);
  return result;
};

/** Copy of an array with each entry applied to the item the array holds at that index. */
const overlayArray = (
  value: ArrayValue,
  entries: [key: string, entry: unknown][],
) => {
  const result = [...value];
  for (const [key, entry] of entries) {
    const index = Number(key);
    if (index in value) result[index] = applyEnhancer(value[index], entry);
  }
  return result;
};
