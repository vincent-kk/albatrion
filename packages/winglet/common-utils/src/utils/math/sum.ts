export const sum = (numbers: readonly number[]): number => {
  let accumulator = 0;
  for (let i = 0, l = numbers.length; i < l; i++) accumulator += numbers[i];
  return accumulator;
};
