import { sum } from './sum';

export const mean = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return NaN;
  return sum(numbers) / numbers.length;
};