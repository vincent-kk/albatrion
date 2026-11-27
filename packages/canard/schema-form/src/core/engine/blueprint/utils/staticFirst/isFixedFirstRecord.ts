/**
 * Inspect plain own-data schema envelopes without invoking authored accessors.
 * @param value - Untrusted authored fragment or property map
 * @returns Whether the value is a plain own-data record without symbols or accessors
 */
export const isFixedFirstRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) return false;
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (!('value' in descriptor) || !descriptor.enumerable) return false;
  }
  return true;
};
