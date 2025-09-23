/**
 * Determines if a number is prime using optimized trial division algorithm.
 *
 * Tests whether the given integer has exactly two positive divisors: 1 and itself.
 * Uses an efficient algorithm that only checks odd divisors up to the square root
 * of the number, with special handling for 2 (the only even prime).
 *
 * @param value - Integer to test for primality (must be an integer)
 * @returns True if the number is prime, false otherwise
 *
 * @example
 * Basic prime number detection:
 * ```typescript
 * import { isPrime } from '@winglet/common-utils';
 *
 * // Prime numbers
 * console.log(isPrime(2)); // true (smallest prime)
 * console.log(isPrime(3)); // true
 * console.log(isPrime(5)); // true
 * console.log(isPrime(17)); // true
 * console.log(isPrime(97)); // true
 * ```
 *
 * @example
 * Composite numbers and edge cases:
 * ```typescript
 * // Composite numbers
 * console.log(isPrime(4)); // false (2 × 2)
 * console.log(isPrime(9)); // false (3 × 3)
 * console.log(isPrime(15)); // false (3 × 5)
 * console.log(isPrime(100)); // false (10 × 10)
 *
 * // Edge cases
 * console.log(isPrime(1)); // false (not prime by definition)
 * console.log(isPrime(0)); // false
 * console.log(isPrime(-5)); // false (negative numbers not prime)
 * ```
 *
 * @remarks
 * **Algorithm Optimization:**
 * - Only tests divisors up to √n (sufficient for primality testing)
 * - Skips even numbers after checking for 2 (halves search space)
 * - Returns false immediately for non-integers and numbers ≤ 1
 * - Special case handling for 2 (only even prime)
 *
 * **Use Cases:**
 * - Cryptographic applications (RSA key generation)
 * - Mathematical computations and number theory
 * - Algorithm optimization (prime factorization)
 * - Educational tools for teaching mathematics
 * - Data structure implementations (hash table sizing)
 * - Security applications requiring prime validation
 *
 * **Performance:** O(√n) time complexity in worst case, O(1) space complexity.
 * Practical performance is much better due to early termination for composite numbers.
 */
export const isPrime = (value: number): boolean => {
  if (!Number.isInteger(value) || value <= 1) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  const sqrt = Math.sqrt(value);
  for (let i = 3; i <= sqrt; i += 2) if (value % i === 0) return false;
  return true;
};
