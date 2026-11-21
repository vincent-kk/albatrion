import { decimalFraction } from './decimalFraction';

/**
 * Compare a finite position with the midpoint of two decimal stops.
 * @param value - Position to project onto the two stops.
 * @param lower - Lower stop in schema units.
 * @param upper - Upper stop in schema units.
 * @returns Whether the upper stop is at least as close as the lower stop.
 */
export const isAtOrAboveMidpoint = (
  value: number,
  lower: number,
  upper: number,
): boolean => {
  const position = decimalFraction(value);
  const left = decimalFraction(lower);
  const right = decimalFraction(upper);
  return (
    2n * position.numerator * left.denominator * right.denominator >=
    position.denominator *
      (left.numerator * right.denominator + right.numerator * left.denominator)
  );
};
