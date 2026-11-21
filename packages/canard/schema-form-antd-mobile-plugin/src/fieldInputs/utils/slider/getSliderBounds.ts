import { decimalRatio } from './getSliderBounds/decimalRatio';
import { decimalStop } from './getSliderBounds/decimalStop';
import { getIntegerSliderStep } from './getSliderBounds/getIntegerSliderStep';
import { isAtOrAboveMidpoint } from './getSliderBounds/isAtOrAboveMidpoint';

/**
 * Build the schema's decimal grid and its input-library coordinate mapping.
 * @param minimum - Inclusive lower bound; absent bounds default to zero.
 * @param maximum - Inclusive upper bound; absent bounds default to one hundred.
 * @param multipleOf - Positive decimal grid step, or an unconstrained numeric schema.
 * @param integer - Restrict all selectable stops to integers.
 * @param exclusiveMinimum - Strict lower bound, intersected with minimum.
 * @param exclusiveMaximum - Strict upper bound, intersected with maximum.
 * @param marks - Labels at authored stops, filtered against the schema.
 * @returns Track endpoints, marked stops, exact navigation and conversion, or an empty disabled track.
 */
export const getSliderBounds = <MarkLabel>(
  minimum?: number,
  maximum?: number,
  multipleOf?: number,
  integer = false,
  exclusiveMinimum?: number,
  exclusiveMaximum?: number,
  marks?: Record<number, MarkLabel>,
) => {
  const lower = Math.max(minimum ?? -Infinity, exclusiveMinimum ?? -Infinity);
  const upper = Math.min(maximum ?? Infinity, exclusiveMaximum ?? Infinity);
  const low = Number.isFinite(lower) ? lower : 0;
  const high = Number.isFinite(upper) ? upper : 100;
  const valid =
    Number.isFinite(low) &&
    Number.isFinite(high) &&
    (multipleOf === undefined ||
      (Number.isFinite(multipleOf) && multipleOf > 0));
  const step = valid
    ? integer
      ? getIntegerSliderStep(multipleOf ?? 1)
      : (multipleOf ?? 1)
    : 1;
  const anchor = multipleOf !== undefined || integer ? 0 : low;
  const strictLow =
    exclusiveMinimum !== undefined && exclusiveMinimum === lower;
  const strictHigh =
    exclusiveMaximum !== undefined && exclusiveMaximum === upper;
  const firstRatio = decimalRatio(valid ? low : 0, valid ? anchor : 0, step);
  const lastRatio = decimalRatio(valid ? high : 0, valid ? anchor : 0, step);
  const firstIndex = strictLow ? firstRatio.floor + 1n : firstRatio.ceil;
  const lastIndex = strictHigh ? lastRatio.ceil - 1n : lastRatio.floor;
  const first = decimalStop(valid ? anchor : 0, firstIndex, step);
  const last =
    multipleOf === undefined && !integer && !strictHigh
      ? high
      : decimalStop(valid ? anchor : 0, lastIndex, step);
  const upperOnly =
    multipleOf === undefined &&
    !integer &&
    strictLow &&
    !strictHigh &&
    high > low &&
    first > high;
  const empty =
    !valid ||
    (!upperOnly &&
      (first > last || first > high || (strictHigh && first === high)));
  const gridMin = empty ? low : upperOnly ? high : first;
  const gridMax = empty ? high : last;
  const clamp = (value: number) => Math.max(gridMin, Math.min(gridMax, value));
  const hasOffGridUpper =
    multipleOf === undefined &&
    !integer &&
    !strictHigh &&
    lastRatio.floor !== lastRatio.ceil;
  const snap = (value: number) => {
    if (!Number.isFinite(value)) return gridMin;
    if (value <= gridMin) return gridMin;
    if (value >= gridMax) return gridMax;
    const nearest = clamp(
      decimalStop(anchor, decimalRatio(value, anchor, step).nearest, step),
    );
    return hasOffGridUpper && isAtOrAboveMidpoint(value, nearest, gridMax)
      ? gridMax
      : nearest;
  };
  const validMarks =
    marks &&
    Object.entries(marks).filter(([key]) => {
      const value = Number(key);
      if (!Number.isFinite(value) || !valid) return false;
      if (multipleOf !== undefined || integer)
        return (
          !empty &&
          value >= gridMin &&
          value <= gridMax &&
          snap(value) === value
        );
      return (
        (strictLow ? value > low : value >= low) &&
        (strictHigh ? value < high : value <= high)
      );
    });
  const stops =
    validMarks?.map(([key]) => Number(key)).sort((a, b) => a - b) ?? [];
  const min = Math.min(gridMin, stops[0] ?? gridMin);
  const max = Math.max(gridMax, stops[stops.length - 1] ?? gridMax);
  const keyboard = (
    key: string,
    current = gridMin,
    shift = false,
  ): number | undefined => {
    if (empty) return undefined;
    if (key === 'Home') return gridMin;
    if (key === 'End') return gridMax;
    const up = key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp';
    const down =
      key === 'ArrowLeft' || key === 'ArrowDown' || key === 'PageDown';
    if (!up && !down) return undefined;
    const ratio = decimalRatio(
      Number.isFinite(current) ? current : gridMin,
      anchor,
      step,
    );
    const count = shift || key.startsWith('Page') ? 10n : 1n;
    return clamp(
      decimalStop(anchor, up ? ratio.floor + count : ratio.ceil - count, step),
    );
  };
  // Library decimal-place counters do not understand exponent notation; integer coordinates avoid their rounding.
  const indexed = step < 1e-6;
  const singleton = upperOnly && min === max;
  const fromLibrary = singleton
    ? () => max
    : (value: number) =>
        indexed
          ? snap(decimalStop(min, BigInt(Math.round(value)), step))
          : value;
  const toLibrary = singleton
    ? () => 1
    : (value: number) =>
        indexed ? Number(decimalRatio(snap(value), min, step).nearest) : value;
  return {
    min,
    max,
    step,
    empty,
    stops,
    libraryMarks:
      validMarks &&
      Object.fromEntries(
        validMarks.map(([key, label]) => [toLibrary(Number(key)), label]),
      ),
    snap,
    getReadOnlyValue: (value: number) =>
      multipleOf === undefined && !integer && value >= min && value <= max
        ? value
        : snap(value),
    keyboard,
    // Use a track with width for a singleton; every coordinate resolves to its sole stop.
    fromLibrary,
    toLibrary,
    libraryMin: indexed || singleton ? 0 : min,
    libraryMax: singleton ? 1 : indexed ? toLibrary(max) : max,
    libraryStep: indexed || singleton ? 1 : step,
  };
};
