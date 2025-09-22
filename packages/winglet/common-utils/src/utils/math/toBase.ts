import { BASE_36_DIGITS } from './constant';

export const toBase = (value: number, base: number): string => {
  if (!Number.isInteger(value))
    throw new Error('toBase is only defined for integers');

  if (!Number.isInteger(base) || base < 2 || base > 36)
    throw new Error('Base must be an integer between 2 and 36');

  if (value === 0) return '0';

  const isNegative = value < 0;
  let absValue = Math.abs(value);
  let result = '';

  while (absValue > 0) {
    result = BASE_36_DIGITS[absValue % base] + result;
    absValue = Math.floor(absValue / base);
  }

  return isNegative ? '-' + result : result;
};
