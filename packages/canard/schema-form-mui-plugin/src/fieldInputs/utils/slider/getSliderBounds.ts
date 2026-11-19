import { round } from '@winglet/common-utils/math';

/**
 * Restrict slider endpoints to the schema's zero-based multiple grid.
 * @param minimum - Inclusive lower bound, defaulting to zero.
 * @param maximum - Inclusive upper bound, defaulting to one hundred.
 * @param step - Positive schema multiple, defaulting to one.
 * @returns The first and last reachable multiples and the original step.
 */
export const getSliderBounds = (minimum = 0, maximum = 100, step = 1) => {
  const [digits, exponent = '0'] = step.toString().split('e');
  const precision = Math.max(
    0,
    (digits.split('.')[1]?.length ?? 0) - Number(exponent),
  );
  const lower = minimum / step;
  const upper = maximum / step;
  return {
    min: round(
      Math.ceil(lower - Math.abs(lower) * Number.EPSILON) * step,
      precision,
    ),
    max: round(
      Math.floor(upper + Math.abs(upper) * Number.EPSILON) * step,
      precision,
    ),
    step,
  };
};
