import { abs } from './abs';

export const digitSum = (value: number): number => {
  if (!Number.isInteger(value))
    throw new Error('digitSum is only defined for integers');
  const absValue = abs(value);
  let accumulator = 0;
  let number = absValue;
  while (number > 0) {
    accumulator += number % 10;
    number = Math.floor(number / 10);
  }
  return accumulator;
};
