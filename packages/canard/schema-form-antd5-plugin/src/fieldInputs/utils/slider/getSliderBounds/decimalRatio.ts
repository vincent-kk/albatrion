import { decimalFraction } from './decimalFraction';

/**
 * Locate a value on an anchored decimal grid without binary division.
 * @param value - Finite value to locate.
 * @param anchor - Finite origin of the grid.
 * @param step - Positive finite distance between grid stops.
 * @returns Lower and upper integer indices.
 */
export const decimalRatio = (value: number, anchor: number, step: number) => {
  const v = decimalFraction(value),
    a = decimalFraction(anchor),
    s = decimalFraction(step);
  const numerator =
    (v.numerator * a.denominator - a.numerator * v.denominator) * s.denominator;
  const denominator = v.denominator * a.denominator * s.numerator;
  const floor =
    numerator >= 0n
      ? numerator / denominator
      : -((-numerator + denominator - 1n) / denominator);
  const remainder = numerator - floor * denominator;
  return {
    floor,
    ceil: remainder === 0n ? floor : floor + 1n,
  };
};
