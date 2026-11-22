import type { SliderProps } from 'antd-mobile';

import type { NumberSchema } from '@canard/schema-form';

import { decimalRatio } from './getSliderBounds/decimalRatio';
import { decimalStop } from './getSliderBounds/decimalStop';
import { getAllowedMarks } from './getSliderBounds/getAllowedMarks';
import { getIntegerSliderStep } from './getSliderBounds/getIntegerSliderStep';

/** Safe geometry for a disabled slider with no legal stop. */
const EMPTY_BOUNDS = {
  min: 0,
  max: 100,
  step: 1,
  isEmpty: true,
  marks: undefined,
} as const;

/**
 * Project schema limits onto the interval of stops the native slider can offer.
 * @param schema - The numeric field schema, with a positive finite multiple when supplied.
 * @param marks - Authored labels and the stops they represent, when supplied.
 * @returns Native bounds, step and marks, marking a track with no legal stop as disabled.
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
  marks?: SliderProps['marks'],
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
  const gridStep = integer ? getIntegerSliderStep(step) : step;
  const authored =
    marks &&
    getAllowedMarks(
      marks,
      { low, high, strictLow, strictHigh },
      hasRequiredGrid ? gridStep : undefined,
    );
  if (!hasRequiredGrid && !strictLow && !strictHigh)
    return {
      min: low,
      max: high,
      step,
      isEmpty: false,
      marks:
        authored?.marks ??
        (high > low && high - low < step
          ? { [low]: null, [high]: null }
          : undefined),
    };

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
        isEmpty: false,
        marks: authored?.marks,
      };
    return { ...EMPTY_BOUNDS, min: low, max: high, marks: authored?.marks };
  }
  if (authored?.marks) {
    return {
      min: Math.min(min, authored.first),
      max: Math.max(max, authored.last),
      step: gridStep,
      isEmpty: false,
      marks: authored.marks,
    };
  }
  return { min, max, step: gridStep, isEmpty: false, marks: undefined };
};
