import { type DisplayGrid, resolveDisplayedStop } from './resolveDisplayedStop';

/**
 * Select the closest permitted pointer stop, with ties resolved upward.
 * @param grid - Independent display grid and sorted marks.
 * @param empty - Whether the track admits interaction.
 * @param value - Pointer position in schema units.
 * @param includeOffGridUpper - Whether the native library compares the upper endpoint.
 * @returns The target or undefined when there are no interactive stops.
 */
export const resolvePointerStop = (
  grid: DisplayGrid,
  empty: boolean,
  value: number,
  includeOffGridUpper: boolean,
): number | undefined => {
  if (empty) return undefined;
  let nearest: number | undefined;
  for (const mark of grid.marks) {
    if (
      nearest === undefined ||
      Math.abs(mark - value) <= Math.abs(nearest - value)
    )
      nearest = mark;
  }
  return (
    nearest ?? resolveDisplayedStop(grid, value, false, includeOffGridUpper)
  );
};
