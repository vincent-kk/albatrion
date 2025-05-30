/**
 * Performance threshold for algorithm selection
 * Based on benchmarks: linear search outperforms Set for arrays < 20 elements
 */
const SMALL_ARRAY_THRESHOLD = 20;

/**
 * Merges two string arrays with priority-based ordering and duplicate removal.
 *
 * This function is used when merging object property keys in JSON schema,
 * preserving the order of important properties defined in the schema while including additional properties.
 *
 * @param preferredKeys - Array of keys to be placed first (order is preserved)
 * @param keys - Array of additional keys to merge
 * @returns Array of keys with duplicates removed and sorted by priority
 *
 * @example
 * ```ts
 * orderedMerge(['name', 'email'], ['id', 'name', 'phone'])
 * // Result: ['name', 'email', 'id', 'phone']
 * ```
 *
 * @performance
 * - Time complexity: O(n) for large arrays, O(n²) for small arrays (optimized)
 * - Space complexity: O(n)
 * - Hybrid approach: linear search for <20 elements, Set-based for >=20 elements
 * - Optimized for array sizes: 100~1000 elements
 */
export const orderedMerge = (
  preferred: string[],
  source: string[],
): string[] => {
  const totalLength = preferred.length + source.length;

  if (totalLength === 0) return [];

  return totalLength < SMALL_ARRAY_THRESHOLD
    ? mergeWithLinearSearch(preferred, source, totalLength)
    : mergeWithSetOptimization(preferred, source, totalLength);
};

/**
 * Linear search based merge for small arrays
 * Optimized for arrays with less than 20 total elements
 *
 * @internal
 */
const mergeWithLinearSearch = (
  preferred: string[],
  source: string[],
  totalLength: number,
): string[] => {
  const result = new Array<string>(totalLength);
  let resultIndex = 0;

  // Phase 1: Add preferredKeys with deduplication
  for (let i = 0; i < preferred.length; i++) {
    const key = preferred[i];
    // Check for duplicates in already added keys
    let isDuplicate = false;
    for (let j = 0; j < resultIndex; j++) {
      if (result[j] === key) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) result[resultIndex++] = key;
  }

  // Phase 2: Add remaining keys with deduplication
  for (let i = 0; i < source.length; i++) {
    const key = source[i];
    // Check if key already exists in result
    let alreadyExists = false;
    for (let j = 0; j < resultIndex; j++) {
      if (result[j] === key) {
        alreadyExists = true;
        break;
      }
    }
    if (!alreadyExists) result[resultIndex++] = key;
  }

  // Adjust to actual used size for memory efficiency
  result.length = resultIndex;
  return result;
};

/**
 * Set-based merge for larger arrays
 * Optimized for arrays with 20 or more total elements
 *
 * @internal
 */
const mergeWithSetOptimization = (
  preferred: string[],
  source: string[],
  totalLength: number,
): string[] => {
  const visited = new Set<string>();
  const result = new Array<string>(totalLength);
  let resultIndex = 0;

  // Phase 1: Process preferredKeys first to ensure priority
  for (let i = 0; i < preferred.length; i++) {
    const key = preferred[i];
    if (visited.has(key)) continue;
    result[resultIndex++] = key;
    visited.add(key);
  }

  // Phase 2: Process remaining keys while excluding already added keys
  for (let i = 0; i < source.length; i++) {
    const key = source[i];
    if (visited.has(key)) continue;
    result[resultIndex++] = key;
    visited.add(key);
  }

  // Adjust to actual used size for memory efficiency
  result.length = resultIndex;
  return result;
};
