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
 * - Time complexity: O(n + m + k log k), where k is the number of referenced groups present in the source
 * - Space complexity: O(n + k), where n is source length
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

  // Bucketed rather than sorted: Array.prototype.sort relocates `undefined` entries to
  // the end without ever consulting the comparator, so a reference order that places
  // `undefined` anywhere but last could not be honoured
  //
  // Two bucket layouts, split by size: when the reference fits the source, preallocated
  // groups win; a larger reference pays per-entry allocation it mostly never uses, so
  // that side keeps only the indices the source actually hits (measured, not assumed)
  if (reference.length <= source.length) {
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
  }

  const sourceSet = new Set(source);
  const referenceMap = new Map<Value, number>();
  for (let i = 0, l = reference.length; i < l; i++) {
    const entry = reference[i];
    if (sourceSet.has(entry)) referenceMap.set(entry, i);
  }

  const referencedGroups = new Map<number, Value[]>();
  const unreferencedItems: Value[] = [];

  for (let i = 0, l = source.length; i < l; i++) {
    const item = source[i];
    const referenceIndex = referenceMap.get(item);
    if (referenceIndex === undefined) unreferencedItems.push(item);
    else {
      const group = referencedGroups.get(referenceIndex);
      if (group === undefined) referencedGroups.set(referenceIndex, [item]);
      else group.push(item);
    }
  }

  const orderedIndices = [...referencedGroups.keys()].sort((a, b) => a - b);
  const result: Value[] = [];
  for (let i = 0, il = orderedIndices.length; i < il; i++) {
    const group = referencedGroups.get(orderedIndices[i]);
    if (group === undefined) continue;
    for (let j = 0, jl = group.length; j < jl; j++) result.push(group[j]);
  }
  for (let i = 0, l = unreferencedItems.length; i < l; i++)
    result.push(unreferencedItems[i]);

  return result;
};
