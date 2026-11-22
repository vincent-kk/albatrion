import { decimalFraction } from './decimalFraction';

/**
 * Materialize one decimal grid stop with a single conversion to a number.
 * @param anchor - Finite origin of the grid.
 * @param index - Signed integer distance from that origin in steps.
 * @param step - Positive finite authored decimal step.
 * @returns The nearest representable number to the exact decimal stop.
 */
export const decimalStop = (anchor: number, index: bigint, step: number) => {
  const a = decimalFraction(anchor),
    s = decimalFraction(step);
  const scale = a.denominator > s.denominator ? a.denominator : s.denominator;
  const numerator =
    a.numerator * (scale / a.denominator) +
    index * s.numerator * (scale / s.denominator);
  return Number(`${numerator}e-${scale.toString().length - 1}`);
};
