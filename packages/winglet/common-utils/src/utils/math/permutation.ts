/**
 * Calculates the number of permutations (n permute r) using iterative method.
 *
 * Computes P(n, r) = n! / (n-r)! representing the number of ways to arrange
 * r items from n total items where order matters. Uses efficient iterative
 * calculation avoiding full factorial computation to prevent overflow.
 *
 * @param n - Total number of items (must be non-negative integer)
 * @param r - Number of items to arrange (must be non-negative integer)
 * @returns Number of ways to arrange r items from n items
 * @throws {Error} When n or r are negative, non-integers, or special values
 *
 * @example
 * Basic permutation calculations:
 * ```typescript
 * import { permutation } from '@winglet/common-utils';
 *
 * console.log(permutation(5, 2)); // 20 (5×4 arrangements)
 * console.log(permutation(4, 3)); // 24 (4×3×2 arrangements)
 * console.log(permutation(6, 1)); // 6 (single item from 6)
 * console.log(permutation(3, 0)); // 1 (empty arrangement)
 * console.log(permutation(5, 5)); // 120 (all items: 5!)
 * ```
 *
 * @example
 * Edge cases and impossible arrangements:
 * ```typescript
 * // Impossible cases (r > n)
 * console.log(permutation(3, 5)); // 0
 * console.log(permutation(2, 10)); // 0
 *
 * // Identity cases
 * console.log(permutation(10, 0)); // 1
 * console.log(permutation(0, 0)); // 1
 *
 * // Large permutations
 * console.log(permutation(10, 3)); // 720
 * console.log(permutation(8, 4)); // 1680
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - P(n, 0) = 1 (empty arrangement)
 * - P(n, 1) = n (single item selection)
 * - P(n, n) = n! (full arrangement)
 * - P(n, r) = 0 when r > n
 * - Order matters (unlike combinations)
 *
 * **Use Cases:**
 * - Arranging people in seats or positions
 * - Password generation with position constraints
 * - Tournament bracket arrangements
 * - Task scheduling with ordered dependencies
 * - Code generation with positional requirements
 * - Probability calculations for ordered outcomes
 *
 * **Performance:** O(r) time complexity, O(1) space complexity.
 * Much more efficient than factorial division for large n values.
 */
export const permutation = (n: number, r: number): number => {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0)
    throw new Error('Permutation is only defined for non-negative integers');
  if (r > n) return 0;
  if (r === 0) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
};
