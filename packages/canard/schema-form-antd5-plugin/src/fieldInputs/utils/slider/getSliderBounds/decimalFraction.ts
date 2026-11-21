/**
 * Express an authored decimal as an exact rational.
 * @param value - Finite schema bound, step or stored value, including exponent notation.
 * @returns Signed numerator and a positive power-of-ten denominator.
 */
export const decimalFraction = (value: number) => {
  const [coefficient, writtenExponent = '0'] = value.toString().split('e');
  const places =
    (coefficient.split('.')[1]?.length ?? 0) - Number(writtenExponent);
  const numerator = BigInt(coefficient.replace('.', ''));
  return places < 0
    ? { numerator: numerator * 10n ** BigInt(-places), denominator: 1n }
    : { numerator, denominator: 10n ** BigInt(places) };
};
