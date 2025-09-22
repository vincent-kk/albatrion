export const isPrime = (value: number): boolean => {
  if (!Number.isInteger(value) || value <= 1) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  const sqrt = Math.sqrt(value);
  for (let i = 3; i <= sqrt; i += 2) if (value % i === 0) return false;
  return true;
};
