import type { SliderProps } from 'antd-mobile';

import { decimalRatio } from './decimalRatio';

/**
 * Keep the configured stops permitted by the schema.
 * @param marks - The label associated with each authored stop.
 * @param limits - The schema's intersected numeric bounds.
 * @param step - The required grid step, when the schema has one.
 * @returns The allowed stops and their outer endpoints for the native track.
 */
export const getAllowedMarks = (
  marks: NonNullable<SliderProps['marks']>,
  limits: {
    low: number;
    high: number;
    strictLow: boolean;
    strictHigh: boolean;
  },
  step?: number,
) => {
  const { low, high, strictLow, strictHigh } = limits;
  const allowed: NonNullable<SliderProps['marks']> = {};
  let first = Infinity;
  let last = -Infinity;
  for (const [key, label] of Object.entries(marks)) {
    const value = Number(key);
    if (!Number.isFinite(value) || value < low || value > high) continue;
    if ((strictLow && value === low) || (strictHigh && value === high))
      continue;
    if (step !== undefined) {
      const { floor, ceil } = decimalRatio(value, 0, step);
      if (floor !== ceil) continue;
    }
    allowed[value] = label;
    first = Math.min(first, value);
    last = Math.max(last, value);
  }
  return { marks: first <= last ? allowed : undefined, first, last };
};
