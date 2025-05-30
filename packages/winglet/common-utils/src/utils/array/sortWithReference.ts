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
  for (let index = 0; index < reference.length; index++)
    referenceMap.set(reference[index], index);

  const referencedGroups: Value[][] = new Array(reference.length);
  for (let index = 0; index < reference.length; index++)
    referencedGroups[index] = [];

  const unreferencedItems: Value[] = [];

  for (let index = 0; index < source.length; index++) {
    const item = source[index];
    const referenceIndex = referenceMap.get(item);
    if (referenceIndex === undefined) unreferencedItems.push(item);
    else referencedGroups[referenceIndex].push(item);
  }

  const result: Value[] = [];
  for (let groupIndex = 0; groupIndex < referencedGroups.length; groupIndex++) {
    const group = referencedGroups[groupIndex];
    for (let itemIndex = 0; itemIndex < group.length; itemIndex++)
      result.push(group[itemIndex]);
  }
  for (let index = 0; index < unreferencedItems.length; index++)
    result.push(unreferencedItems[index]);

  return result;
};
