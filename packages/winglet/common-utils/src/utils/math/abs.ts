/**
 * Calculates the absolute value of a number with enhanced type safety.
 *
 * Direct alias for the native Math.abs method, providing consistent behavior
 * for obtaining the non-negative value of any number. Handles special cases
 * like Infinity and NaN according to JavaScript specifications.
 *
 * @param value - The numeric value to get the absolute value of
 * @returns The absolute (non-negative) value of the input
 *
 * @example
 * Basic absolute value operations:
 * ```typescript
 * import { abs } from '@winglet/common-utils';
 *
 * console.log(abs(5));      // 5
 * console.log(abs(-5));     // 5
 * console.log(abs(-10.5));  // 10.5
 * console.log(abs(0));      // 0
 * console.log(abs(-0));     // 0
 * ```
 *
 * @example
 * Distance calculation between points:
 * ```typescript
 * function distance(a: number, b: number): number {
 *   return abs(a - b);
 * }
 *
 * console.log(distance(10, 3));   // 7
 * console.log(distance(3, 10));   // 7
 * console.log(distance(-5, 5));   // 10
 * ```
 *
 * @remarks
 * **Special Cases:**
 * - Returns Infinity for ±Infinity
 * - Returns NaN for NaN input
 * - Handles -0 correctly (returns 0)
 *
 * **Use Cases:**
 * - Distance calculations
 * - Error magnitude computation
 * - Converting negative values to positive
 * - Mathematical operations requiring non-negative values
 */
export const abs = Math.abs;
