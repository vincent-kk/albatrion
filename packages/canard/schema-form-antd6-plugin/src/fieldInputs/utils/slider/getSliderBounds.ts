import { round } from '@winglet/common-utils/math';

import { getIntegerSliderStep } from './getSliderBounds/getIntegerSliderStep';

/**
 * Restrict slider endpoints to the schema's zero-based multiple grid.
 * @param minimum - Inclusive lower bound, defaulting to zero.
 * @param maximum - Inclusive upper bound, defaulting to one hundred.
 * @param multipleOf - Optional positive schema multiple.
 * @param integer - Whether the schema admits integers only.
 * @returns Reachable bounds and step, or disabled bounds when the grid is empty.
 */
export const getSliderBounds = (
  minimum = 0,
  maximum = 100,
  multipleOf?: number,
  integer = false,
) => {
  const step = integer
    ? getIntegerSliderStep(multipleOf ?? 1)
    : (multipleOf ?? 1);
  if (!integer && multipleOf === undefined)
    return { min: minimum, max: maximum, step, empty: false };
  const [digits, exponent = '0'] = step.toString().split('e');
  const precision = Math.max(
    0,
    (digits.split('.')[1]?.length ?? 0) - Number(exponent),
  );
  const lower = minimum / step;
  const upper = maximum / step;
  const min = round(
    Math.ceil(lower - Math.abs(lower) * Number.EPSILON) * step,
    precision,
  );
  const max = round(
    Math.floor(upper + Math.abs(upper) * Number.EPSILON) * step,
    precision,
  );
  const empty = min > max;
  return {
    min: empty ? minimum : min,
    max: empty ? maximum : max,
    step,
    empty,
  };
};
