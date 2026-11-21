/** Arithmetic and authored stop constraints for the independent model. */
export interface DisplayGrid {
  units: (value: number) => bigint;
  number: (value: bigint) => number;
  floor: (value: bigint) => bigint;
  gridMin: bigint;
  gridMax: bigint;
  anchor: bigint;
  increment: bigint;
  displayMin: number;
  displayMax: number;
  unsteppedNumber: boolean;
  retainsUpper: boolean;
  marks: readonly number[];
}

/**
 * Project a stored value onto an authored stop in the requested display mode.
 * @param grid - Independent decimal model and valid marks.
 * @param stored - Stored value or unset.
 * @param readOnly - Allow an unstepped number within the display range.
 * @param includeOffGridUpper - Include an authored upper endpoint in the projection.
 * @returns Schema value shown by the thumb.
 */
export const resolveDisplayedStop = (
  grid: DisplayGrid,
  stored: number | undefined,
  readOnly: boolean,
  includeOffGridUpper: boolean,
): number | undefined => {
  if (stored === undefined) return undefined;
  if (
    (readOnly &&
      includeOffGridUpper &&
      grid.unsteppedNumber &&
      stored >= grid.displayMin &&
      stored <= grid.displayMax) ||
    grid.marks.includes(stored)
  )
    return stored;
  const position = grid.units(stored);
  const lower =
    grid.anchor + grid.floor(position - grid.anchor) * grid.increment;
  const upper = lower + grid.increment;
  const nearest = position - lower < upper - position ? lower : upper;
  const { gridMin, gridMax } = grid;
  const snapped =
    nearest < gridMin ? gridMin : nearest > gridMax ? gridMax : nearest;
  if (position <= gridMin) return grid.number(gridMin);
  if (includeOffGridUpper && position >= gridMax) return grid.number(gridMax);
  const distance = snapped > position ? snapped - position : position - snapped;
  return grid.number(
    includeOffGridUpper && grid.retainsUpper && gridMax - position <= distance
      ? gridMax
      : snapped,
  );
};
