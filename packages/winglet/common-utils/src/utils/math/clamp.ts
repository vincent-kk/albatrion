/**
 * Restricts a number to be within a specified range.
 *
 * Ensures that a value stays within the bounds defined by minimum and maximum
 * values. If the value exceeds the bounds, it returns the boundary value.
 * Commonly used for constraining user input, animation values, or preventing
 * overflow in calculations.
 *
 * @param value - The number to be clamped
 * @param min - The lower boundary of the range
 * @param max - The upper boundary of the range
 * @returns The clamped value within [min, max] range
 *
 * @example
 * Basic range restriction:
 * ```typescript
 * import { clamp } from '@winglet/common-utils';
 *
 * console.log(clamp(5, 0, 10));   // 5 (within range)
 * console.log(clamp(-5, 0, 10));  // 0 (below minimum)
 * console.log(clamp(15, 0, 10));  // 10 (above maximum)
 * console.log(clamp(0.5, 0, 1));  // 0.5 (works with decimals)
 * ```
 *
 * @example
 * UI element positioning:
 * ```typescript
 * function constrainPosition(x: number, y: number) {
 *   const viewportWidth = window.innerWidth;
 *   const viewportHeight = window.innerHeight;
 *
 *   return {
 *     x: clamp(x, 0, viewportWidth),
 *     y: clamp(y, 0, viewportHeight)
 *   };
 * }
 * ```
 *
 * @remarks
 * **Special Cases:**
 * - When min equals max, always returns that value
 * - Handles Infinity: clamps to boundary values
 * - Returns NaN if value is NaN
 *
 * **Use Cases:**
 * - Constraining user input values
 * - Limiting animation parameters
 * - Preventing array index overflow
 * - Color value normalization (0-255 or 0-1)
 * - Volume/brightness controls
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};