export const min = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return Infinity;
  let minimum = numbers[0];
  for (let i = 1, l = numbers.length; i < l; i++)
    if (numbers[i] < minimum) minimum = numbers[i];
  return minimum;
};
