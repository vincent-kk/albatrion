import { max } from './max';
import { min } from './min';

export const range = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return NaN;
  return max(numbers) - min(numbers);
};