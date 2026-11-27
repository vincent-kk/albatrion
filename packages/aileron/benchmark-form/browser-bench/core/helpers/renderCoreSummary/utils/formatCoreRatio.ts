import { formatCoreNumber } from './formatCoreNumber';

/**
 * Format ratio or percent evidence while distinguishing a zero baseline from no comparison.
 * @param value - Numeric comparison, null when non-comparable, or undefined when unmeasured.
 * @param digits - Fractional decimal places, defaulting to three.
 * @returns N/A for null, an em dash for undefined, or a fixed-point numeric value.
 */
export function formatCoreRatio(
  value: number | null | undefined,
  digits = 3,
): string {
  return value === null ? 'N/A' : formatCoreNumber(value, digits);
}
