/** Canonical ascending products retained for repeat calls. */
const cache = new Map<number, number>([[1, 1]]);

/** Largest canonical product already stored in the cache. */
let highestCachedInput = 1;

/**
 * Calculates the factorial of a non-negative integer with intelligent caching.
 *
 * Computes n! = n × (n-1) × (n-2) × ... × 2 × 1 using an optimized algorithm
 * with memoization for performance. The cache allows reusing previously computed
 * factorials and can leverage partial results for more efficient computation.
 *
 * @param n - Non-negative integer to calculate factorial for
 * @returns The factorial of n (n!)
 * @throws {Error} When n is negative, non-integer, or special values (Infinity, NaN)
 *
 * @example
 * Basic factorial calculations:
 * ```typescript
 * import { factorial } from '@winglet/common-utils';
 *
 * console.log(factorial(0)); // 1 (by definition)
 * console.log(factorial(1)); // 1
 * console.log(factorial(5)); // 120 (5 × 4 × 3 × 2 × 1)
 * console.log(factorial(7)); // 5040
 * console.log(factorial(10)); // 3628800
 * ```
 *
 * @example
 * Performance optimization with caching:
 * ```typescript
 * // First calculation computes and caches result
 * console.log(factorial(15)); // 1307674368000 (computed and cached)
 *
 * // Subsequent calls use cached value
 * console.log(factorial(15)); // 1307674368000 (retrieved from cache)
 *
 * // Larger factorials can use cached intermediate results
 * console.log(factorial(20)); // Uses cached factorial(15) to optimize computation
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - 0! = 1 and 1! = 1 by mathematical definition
 * - n! grows extremely rapidly (factorial growth)
 * - Factorial is only defined for non-negative integers
 * - Results become very large quickly (20! ≈ 2.4 × 10¹⁸)
 *
 * **Use Cases:**
 * - Combinatorics and permutation calculations
 * - Probability theory and statistical analysis
 * - Mathematical formulas and series expansions
 * - Algorithm analysis and complexity calculations
 * - Gamma function approximations
 * - Taylor and Maclaurin series computations
 *
 * **Performance:** O(n) time complexity for first calculation, O(1) for cached results.
 * Space complexity grows with cache size but provides significant speedup for repeated calculations.
 * Cache persists across function calls for the lifetime of the application.
 */
export const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0)
    throw new Error('Factorial is only defined for non-negative integers');
  if (n === 0 || n === 1) return 1;
  if (cache.has(n)) return cache.get(n)!;
  if (n > 170) return Infinity;
  let result = cache.get(highestCachedInput)!;
  for (let i = highestCachedInput + 1; i <= n; i++) {
    result *= i;
    cache.set(i, result);
  }
  highestCachedInput = n;
  return result;
};
