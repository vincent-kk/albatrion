const cache = new Map<number, number>();

export const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0)
    throw new Error('Factorial is only defined for non-negative integers');
  if (n === 0 || n === 1) return 1;
  if (cache.has(n)) return cache.get(n)!;
  let result = n;
  for (let i = n - 1; i >= 2; i--) {
    if (cache.has(i)) {
      result *= cache.get(i)!;
      break;
    }
    result *= i;
  }
  cache.set(n, result);
  return result;
};
