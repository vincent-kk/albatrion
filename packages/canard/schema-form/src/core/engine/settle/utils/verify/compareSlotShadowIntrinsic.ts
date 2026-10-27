/**
 * Compare values carried in intrinsic object slots rather than enumerable keys.
 * @param actual - Retained-path public object
 * @param shadow - Baseline object with the same prototype
 * @param compare - Session-aware recursive check for collection contents
 * @returns Whether intrinsic contents agree, before ordinary property comparison
 */
export const compareSlotShadowIntrinsic = (
  actual: object,
  shadow: object,
  compare: (actual: unknown, shadow: unknown, key: string) => void,
): boolean => {
  if (actual instanceof Date && shadow instanceof Date)
    return Object.is(actual.getTime(), shadow.getTime());
  if (actual instanceof RegExp && shadow instanceof RegExp)
    return (
      actual.source === shadow.source &&
      actual.flags === shadow.flags &&
      actual.lastIndex === shadow.lastIndex
    );
  if (actual instanceof Map && shadow instanceof Map) {
    if (actual.size !== shadow.size) return false;
    const entries = shadow.entries();
    let index = 0;
    for (const [key, value] of actual) {
      const baseline = entries.next().value;
      if (!baseline) return false;
      compare(key, baseline[0], 'mapKey.' + index);
      compare(value, baseline[1], 'mapValue.' + index++);
    }
  }
  if (actual instanceof Set && shadow instanceof Set) {
    if (actual.size !== shadow.size) return false;
    const entries = shadow.values();
    let index = 0;
    for (const value of actual)
      compare(value, entries.next().value, 'set.' + index++);
  }
  if (actual instanceof ArrayBuffer && shadow instanceof ArrayBuffer) {
    if (actual.byteLength !== shadow.byteLength) return false;
    const bytes = new Uint8Array(actual);
    const baseline = new Uint8Array(shadow);
    for (let index = 0; index < bytes.length; index++)
      if (bytes[index] !== baseline[index]) return false;
  }
  return true;
};
