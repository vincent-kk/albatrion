import type { NumberSchema } from '@canard/schema-form';

import { decimalRatio } from './getSliderBounds/decimalRatio';
import { decimalStop } from './getSliderBounds/decimalStop';
import { getIntegerSliderStep } from './getSliderBounds/getIntegerSliderStep';

/** Safe geometry for a disabled slider with no legal stop. */
const EMPTY_BOUNDS = {
  min: 0,
  max: 100,
  step: 1,
  initialValue: 0,
  isEmpty: true,
} as const;

/**
 * Project schema limits onto the interval of stops the native slider can offer.
 * @param schema - The numeric field schema, with a positive finite multiple when supplied.
 * @param storedValue - The optional form value to present at initialization.
 * @returns The native slider's bounds, step and initial value, or a disabled track.
 */
export const getSliderBounds = (
  {
    type,
    minimum,
    maximum,
    exclusiveMinimum,
    exclusiveMaximum,
    multipleOf,
  }: NumberSchema,
  storedValue?: number,
) => {
  const lower = Math.max(minimum ?? -Infinity, exclusiveMinimum ?? -Infinity);
  const upper = Math.min(maximum ?? Infinity, exclusiveMaximum ?? Infinity);
  const low = lower === -Infinity ? 0 : lower;
  const high = upper === Infinity ? 100 : upper;
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high)
    return EMPTY_BOUNDS;

  const step = multipleOf ?? 1;
  if (!Number.isFinite(step) || step <= 0) return EMPTY_BOUNDS;
  const integer =
    typeof type === 'string' ? type === 'integer' : type.includes('integer');
  const hasRequiredGrid = integer || multipleOf !== undefined;
  const strictLow = exclusiveMinimum === lower;
  const strictHigh = exclusiveMaximum === upper;
  if (!hasRequiredGrid && !strictLow && !strictHigh)
    return {
      min: low,
      max: high,
      step,
      initialValue: storedValue ?? low,
      isEmpty: false,
    };

  const gridStep = integer ? getIntegerSliderStep(step) : step;
  const anchor = hasRequiredGrid ? 0 : low;
  const first = decimalRatio(low, anchor, gridStep);
  const last = decimalRatio(high, anchor, gridStep);
  const min = decimalStop(
    anchor,
    strictLow ? first.floor + 1n : first.ceil,
    gridStep,
  );
  const max =
    hasRequiredGrid || strictHigh
      ? decimalStop(anchor, strictHigh ? last.ceil - 1n : last.floor, gridStep)
      : high;
  if (min > max) {
    if (!hasRequiredGrid && strictLow && !strictHigh && high > low)
      return {
        min: high,
        max: high,
        step: gridStep,
        initialValue: high,
        isEmpty: false,
      };
    return EMPTY_BOUNDS;
  }
  let initialValue =
    storedValue !== undefined && Number.isFinite(storedValue)
      ? Math.min(max, Math.max(min, storedValue))
      : min;
  if (hasRequiredGrid && initialValue > min && initialValue < max) {
    const { nearest } = decimalRatio(initialValue, anchor, gridStep);
    initialValue = decimalStop(anchor, nearest, gridStep);
  }
  return { min, max, step: gridStep, initialValue, isEmpty: false };
};
