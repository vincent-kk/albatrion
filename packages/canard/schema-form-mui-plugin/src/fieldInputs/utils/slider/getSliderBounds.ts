import { decimalRatio } from './getSliderBounds/decimalRatio';
import { decimalStop } from './getSliderBounds/decimalStop';
import { getIntegerSliderStep } from './getSliderBounds/getIntegerSliderStep';

/**
 * Build the schema's decimal grid and its input-library coordinate mapping.
 * @param minimum - Inclusive lower bound; absent bounds default to zero.
 * @param maximum - Inclusive upper bound; absent bounds default to one hundred.
 * @param multipleOf - Positive decimal grid step, or an unconstrained numeric schema.
 * @param integer - Restrict all selectable stops to integers.
 * @param exclusiveMinimum - Strict lower bound, intersected with minimum.
 * @param exclusiveMaximum - Strict upper bound, intersected with maximum.
 * @returns Track endpoints, exact navigation and conversion, or an empty disabled track.
 */
export const getSliderBounds = (
  minimum?: number,
  maximum?: number,
  multipleOf?: number,
  integer = false,
  exclusiveMinimum?: number,
  exclusiveMaximum?: number,
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
  const empty =
    !valid || first > last || first > high || (strictHigh && first === high);
  const min = empty ? low : first,
    max = empty ? high : last;
  const clamp = (value: number) => Math.max(min, Math.min(max, value));
  const snap = (value: number) => {
    if (!Number.isFinite(value)) return min;
    if (value <= min) return min;
    if (value >= max) return max;
    const nearest = clamp(
      decimalStop(anchor, decimalRatio(value, anchor, step).nearest, step),
    );
    return multipleOf === undefined &&
      !integer &&
      !strictHigh &&
      Math.abs(max - value) < Math.abs(nearest - value)
      ? max
      : nearest;
  };
  const keyboard = (
    key: string,
    current = min,
    shift = false,
  ): number | undefined => {
    if (empty) return undefined;
    if (key === 'Home') return min;
    if (key === 'End') return max;
    const up = key === 'ArrowRight' || key === 'ArrowUp' || key === 'PageUp';
    const down =
      key === 'ArrowLeft' || key === 'ArrowDown' || key === 'PageDown';
    if (!up && !down) return undefined;
    const ratio = decimalRatio(
      Number.isFinite(current) ? current : min,
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
  const fromLibrary = (value: number) =>
    indexed ? snap(decimalStop(min, BigInt(Math.round(value)), step)) : value;
  const toLibrary = (value: number) =>
    indexed ? Number(decimalRatio(snap(value), min, step).nearest) : value;
  return {
    min,
    max,
    step,
    empty,
    snap,
    initialValue: (value: number) =>
      multipleOf === undefined && !integer && value >= min && value <= max
        ? value
        : snap(value),
    keyboard,
    fromLibrary,
    toLibrary,
    libraryMin: indexed ? 0 : min,
    libraryMax: indexed ? toLibrary(max) : max,
    libraryStep: indexed ? 1 : step,
  };
};
