export const permutation = (n: number, r: number): number => {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0)
    throw new Error('Permutation is only defined for non-negative integers');
  if (r > n) return 0;
  if (r === 0) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
};
