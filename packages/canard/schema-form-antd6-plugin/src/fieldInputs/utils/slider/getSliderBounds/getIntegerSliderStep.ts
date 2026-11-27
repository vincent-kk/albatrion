import { decimalFraction } from './decimalFraction';

/**
 * Find the smallest positive integer that is an exact decimal multiple of a step.
 * @param step - Positive finite JSON Schema multiple.
 * @returns The numerator of the step expressed as a reduced decimal fraction.
 */
export const getIntegerSliderStep = (step: number): number => {
  if (Number.isInteger(step)) return step;
  const { numerator, denominator } = decimalFraction(step);
  let left = numerator;
  let right = denominator;
  while (right !== 0n) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }
  return Number(numerator / left);
};
