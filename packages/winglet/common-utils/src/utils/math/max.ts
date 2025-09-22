export const max = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return -Infinity;
  let maximum = numbers[0];
  for (let i = 1, l = numbers.length; i < l; i++)
    if (numbers[i] > maximum) maximum = numbers[i];
  return maximum;
};
