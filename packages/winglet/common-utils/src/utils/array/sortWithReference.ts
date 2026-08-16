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
  reference?: readonly Value[],
): Value[] => {
  // Copied on both paths so the caller never receives its own array back and cannot
  // mutate the input through the result
  if (!reference) return source.slice();

  const referenceLength = reference.length;
  const referenceMap = new Map<Value, number>();
  for (let i = 0; i < referenceLength; i++) referenceMap.set(reference[i], i);

  // Unreferenced items rank past every referenced one, and a stable sort keeps items
  // that share a rank in source order — the bucket-per-reference-entry form allocated
  // one array for every reference entry even when the source touched none of them
  return source
    .slice()
    .sort(
      (left, right) =>
        (referenceMap.get(left) ?? referenceLength) -
        (referenceMap.get(right) ?? referenceLength),
    );
};
