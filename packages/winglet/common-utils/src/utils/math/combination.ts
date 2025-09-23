/**
 * Calculates the number of combinations (n choose r) using efficient iterative method.
 *
 * Computes the binomial coefficient C(n, r) = n! / (r! * (n-r)!) using an optimized
 * algorithm that avoids computing large factorials. Automatically uses the symmetry
 * property C(n, r) = C(n, n-r) to minimize iterations and prevent overflow.
 *
 * @param n - Total number of items (must be non-negative integer)
 * @param r - Number of items to choose (must be non-negative integer)
 * @returns Number of ways to choose r items from n items
 * @throws {Error} When n or r are negative, non-integers, or special values (Infinity, NaN)
 *
 * @example
 * Basic combination calculations:
 * ```typescript
 * import { combination } from '@winglet/common-utils';
 *
 * console.log(combination(5, 2)); // 10 - choosing 2 items from 5
 * console.log(combination(6, 4)); // 15 - choosing 4 items from 6
 * console.log(combination(10, 5)); // 252 - choosing 5 items from 10
 *
 * // Edge cases
 * console.log(combination(5, 0)); // 1 - choosing 0 items (empty set)
 * console.log(combination(5, 5)); // 1 - choosing all items
 * console.log(combination(5, 6)); // 0 - impossible to choose more than available
 * ```
 *
 * @example
 * Symmetry property and optimization:
 * ```typescript
 * // Uses symmetry C(n, r) = C(n, n-r) for efficiency
 * console.log(combination(20, 3)); // 1140 - optimized to compute C(20, 3)
 * console.log(combination(20, 17)); // 1140 - optimized to compute C(20, 3)
 *
 * // Large combinations that would overflow with factorial approach
 * console.log(combination(50, 25)); // 126410606437752
 * console.log(combination(100, 2)); // 4950
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - Returns 1 when r = 0 or r = n (choosing nothing or everything)
 * - Returns 0 when r > n (impossible combinations)
 * - Uses symmetry C(n, r) = C(n, n-r) to optimize performance
 * - Avoids factorial computation to prevent integer overflow
 *
 * **Use Cases:**
 * - Probability calculations and combinatorial analysis
 * - Generating lottery odds and gambling probabilities
 * - Algorithm complexity analysis (choosing subsets)
 * - Statistical sampling and experimental design
 * - Graph theory (selecting vertices or edges)
 * - Binomial expansion coefficients
 *
 * **Performance:** O(min(r, n-r)) time complexity, O(1) space complexity.
 * Much more efficient than factorial-based approaches for large values.
 */
export const combination = (n: number, r: number): number => {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0)
    throw new Error('Combination is only defined for non-negative integers');
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  if (r > n - r) r = n - r;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= n - i;
    result /= i + 1;
  }
  return Math.round(result);
};
