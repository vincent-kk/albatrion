/**
 * Find the smallest positive integer that is an exact decimal multiple of a step.
 * @param step - Positive finite JSON Schema multiple.
 * @returns The numerator of the step expressed as a reduced decimal fraction.
 */
export const getIntegerSliderStep = (step: number): number => {
  if (Number.isInteger(step)) return step;
  const [coefficient, exponent = '0'] = step.toString().split('e');
  const places = (coefficient.split('.')[1]?.length ?? 0) - Number(exponent);
  const numerator = BigInt(coefficient.replace('.', ''));
  let left = numerator;
  let right = 10n ** BigInt(places);
  while (right !== 0n) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }
  return Number(numerator / left);
};
