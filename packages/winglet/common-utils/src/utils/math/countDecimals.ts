import { maxLite } from './maxLite';

/**
 * Counts how many decimal places a number carries in its exact decimal form.
 *
 * `Number.prototype.toString` switches to exponential notation below `1e-6`,
 * where the fraction digits are encoded in the exponent rather than after a dot.
 * Reading `split('.')[1]` reports `0` for those values; this function reads the
 * exponent so `1e-7` is correctly counted as 7 decimal places.
 *
 * @param value - Finite number to inspect
 * @returns Number of decimal places, never negative
 *
 * @example
 * ```typescript
 * countDecimals(1.25); // 2
 * countDecimals(1e-7); // 7 (exponential notation)
 * countDecimals(1.5e-7); // 8 (mantissa digits plus exponent)
 * countDecimals(150); // 0
 * ```
 *
 * @remarks
 * Values whose exponent is positive collapse toward 0 rather than a negative
 * count, so the result is always usable as a `Math.pow(10, n)` scaling factor.
 */
export const countDecimals = (value: number): number => {
  const text = '' + value;
  const exponentIndex = text.indexOf('e');
  const mantissa = exponentIndex === -1 ? text : text.slice(0, exponentIndex);
  const dotIndex = mantissa.indexOf('.');
  const fractionDigits = dotIndex === -1 ? 0 : mantissa.length - dotIndex - 1;
  const exponent = exponentIndex === -1 ? 0 : +text.slice(exponentIndex + 1);
  return maxLite(0, fractionDigits - exponent);
};
