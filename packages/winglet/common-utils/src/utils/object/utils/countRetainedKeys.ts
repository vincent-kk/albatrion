/**
 * Counts the keys that survive an omit set.
 *
 * Deep-equality comparisons must count both operands this way: comparing raw key
 * counts first would reject an asymmetric pair before omit ever applies, which is
 * exactly what omitting a key is meant to allow.
 *
 * @param keys - Own keys of one side of the comparison
 * @param omits - Keys excluded from the comparison
 * @returns Number of keys that participate in the comparison
 */
export const countRetainedKeys = (
  keys: readonly PropertyKey[],
  omits: Set<PropertyKey>,
): number => {
  let count = 0;
  for (let i = 0, l = keys.length; i < l; i++) if (!omits.has(keys[i])) count++;
  return count;
};
