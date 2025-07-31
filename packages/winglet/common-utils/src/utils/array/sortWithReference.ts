/**
 * Sorts an array based on the order defined in a reference array.
 * Elements present in the reference array are sorted according to their order in the reference,
 * while elements not in the reference array are placed after the sorted elements.
 *
 * @param source - The array to be sorted
 * @param reference - The reference array that defines the sorting order
 * @returns A new sorted array without modifying the original target array
 *
 * @example
 * ```typescript
 * const target = ['c', 'a', 'b', 'd'];
 * const reference = ['a', 'b', 'c'];
 * const result = sortWithReference(target, reference);
 * // Returns: ['a', 'b', 'c', 'd']
 * ```
 *
 * @remarks
 * - Time complexity: O(n + m) where n is target length and m is reference length
 * - Space complexity: O(n + m) with minimal object creation
 * - Elements not present in the reference array maintain their relative order at the end
 * - The original target array is not modified (immutable operation)
 * - Handles duplicate elements correctly
 */
export const sortWithReference = <Value>(
  source: Value[],
  reference?: Value[],
): Value[] => {
  if (!reference) return source;

  const referenceMap = new Map<Value, number>();
  for (let i = 0, l = reference.length; i < l; i++)
    referenceMap.set(reference[i], i);

  const referencedGroups: Value[][] = new Array(reference.length);
  for (let i = 0, l = reference.length; i < l; i++) referencedGroups[i] = [];

  const unreferencedItems: Value[] = [];

  for (let i = 0, l = source.length; i < l; i++) {
    const item = source[i];
    const referenceIndex = referenceMap.get(item);
    if (referenceIndex === undefined) unreferencedItems.push(item);
    else referencedGroups[referenceIndex].push(item);
  }

  const result: Value[] = [];
  for (let i = 0, il = referencedGroups.length; i < il; i++) {
    const group = referencedGroups[i];
    for (let j = 0, jl = group.length; j < jl; j++) result.push(group[j]);
  }
  for (let i = 0, l = unreferencedItems.length; i < l; i++)
    result.push(unreferencedItems[i]);

  return result;
};
