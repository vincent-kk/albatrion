const cache = new Map<number, number>();

export const fibonacci = (number: number): number => {
  if (!Number.isInteger(number) || number < 0)
    throw new Error('Fibonacci is only defined for non-negative integers');
  if (number === 0) return 0;
  if (number === 1) return 1;
  if (cache.has(number)) return cache.get(number)!;
  let left = 0;
  let right = 1;
  let temp;
  for (let i = 2; i <= number; i++) {
    temp = left + right;
    left = right;
    right = temp;
  }
  cache.set(number, right);
  return right;
};
