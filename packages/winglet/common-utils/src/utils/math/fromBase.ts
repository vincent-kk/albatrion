import { BASE_36_DIGITS } from './constant';

export const fromBase = (value: string, base: number): number => {
  if (typeof value !== 'string' || value.length === 0)
    throw new Error('Value must be a non-empty string');
  if (!Number.isInteger(base) || base < 2 || base > 36)
    throw new Error('Base must be an integer between 2 and 36');

  const isNegative = value[0] === '-';
  const cleanValue = isNegative ? value.slice(1) : value;
  const upperValue = cleanValue.toUpperCase();

  let result = 0;
  for (let i = 0; i < upperValue.length; i++) {
    const digit = BASE_36_DIGITS.indexOf(upperValue[i]);
    if (digit === -1 || digit >= base)
      throw new Error(`Invalid digit '${upperValue[i]}' for base ${base}`);
    result = result * base + digit;
  }
  return isNegative ? -result : result;
};
