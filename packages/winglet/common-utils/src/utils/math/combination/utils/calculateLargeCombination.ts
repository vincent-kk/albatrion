/**
 * Calculates a validated large binomial coefficient with cancelled integer steps.
 * @param n - Nonnegative integer total, greater than 51
 * @param r - Positive choice count, already reduced by symmetry
 * @returns Its number value, exact while the coefficient is a safe integer
 */
export const calculateLargeCombination = (n: number, r: number): number => {
  let result = 1;
  for (let i = 0; i < r; i++) {
    const divisor = greatestCommonDivisor(n - i, i + 1);
    const product = (result / ((i + 1) / divisor)) * ((n - i) / divisor);
    if (product > Number.MAX_SAFE_INTEGER) {
      let exact = BigInt(result);
      for (; i < r; i++) exact = exact * BigInt(n - i) / BigInt(i + 1);
      return Number(exact);
    }
    result = product;
  }
  return result;
};

/** Returns the positive common divisor used to cancel one binomial step. */
const greatestCommonDivisor = (left: number, right: number): number => {
  while (right) { const remainder = left % right; left = right; right = remainder; }
  return left;
};
