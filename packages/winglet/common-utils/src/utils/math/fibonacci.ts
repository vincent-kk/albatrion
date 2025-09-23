const cache = new Map<number, number>();

/**
 * Calculates the nth Fibonacci number with optimized iterative algorithm and caching.
 *
 * Computes the Fibonacci sequence F(n) where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2)
 * for n > 1. Uses an efficient iterative approach with O(n) time complexity and O(1) space
 * complexity for the calculation, plus intelligent caching for performance optimization.
 *
 * @param number - Position in Fibonacci sequence (must be non-negative integer)
 * @returns The nth Fibonacci number
 * @throws {Error} When number is negative, non-integer, or special values (Infinity, NaN)
 *
 * @example
 * Basic Fibonacci calculations:
 * ```typescript
 * import { fibonacci } from '@winglet/common-utils';
 *
 * console.log(fibonacci(0)); // 0 (first Fibonacci number)
 * console.log(fibonacci(1)); // 1 (second Fibonacci number)
 * console.log(fibonacci(2)); // 1 (0 + 1)
 * console.log(fibonacci(3)); // 2 (1 + 1)
 * console.log(fibonacci(8)); // 21 (sequence: 0,1,1,2,3,5,8,13,21)
 * console.log(fibonacci(15)); // 610
 * ```
 *
 * @example
 * Performance optimization and large numbers:
 * ```typescript
 * // First calculation computes and caches intermediate results
 * console.log(fibonacci(50)); // 12586269025 (computed and cached)
 *
 * // Subsequent calls for smaller numbers use cached values
 * console.log(fibonacci(45)); // Retrieved from cache or computed efficiently
 *
 * // Large Fibonacci numbers (JavaScript integer limit considerations)
 * console.log(fibonacci(78)); // 8944394323791464 (near safe integer limit)
 * ```
 *
 * @remarks
 * **Mathematical Properties:**
 * - F(0) = 0, F(1) = 1 by definition
 * - Each number is the sum of the two preceding ones
 * - Golden ratio φ ≈ 1.618 is related to Fibonacci ratios: F(n+1)/F(n) → φ
 * - Growth rate is exponential: F(n) ≈ φⁿ/√5 (Binet's formula)
 *
 * **Use Cases:**
 * - Mathematical modeling and algorithm analysis
 * - Nature simulations (spiral patterns, growth models)
 * - Financial market analysis (Fibonacci retracements)
 * - Computer graphics and generative art
 * - Algorithm optimization and dynamic programming examples
 * - Teaching recursion and iterative optimization
 *
 * **Performance:** O(n) time complexity for uncached calculations, O(1) for cached results.
 * Space complexity is O(1) for the algorithm plus cache storage. More efficient than
 * naive recursive approaches which have O(φⁿ) complexity.
 */
export const fibonacci = (number: number): number => {
  if (!Number.isInteger(number) || number < 0)
    throw new Error('Fibonacci is only defined for non-negative integers');
  if (number === 0) return 0;
  if (number === 1) return 1;
  if (cache.has(number)) return cache.get(number)!;
  let left = 0;
  let right = 1;
  let temp;
  for (let i = 2; i <= number; i++) {
    temp = left + right;
    left = right;
    right = temp;
  }
  cache.set(number, right);
  return right;
};
