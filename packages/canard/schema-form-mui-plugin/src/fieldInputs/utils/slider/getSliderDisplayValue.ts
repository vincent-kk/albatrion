/**
 * Resolve what the thumb presents in the current mode.
 * @param stored - Last committed schema value.
 * @param draft - User movement awaiting a commit.
 * @param minimum - Thumb position while the value is unset.
 * @param normalize - Current mode's schema-to-display conversion.
 * @param locked - Whether this render permits a draft to remain visible.
 * @returns The thumb position in schema units.
 */
export const getSliderDisplayValue = (
  stored: number | null | undefined,
  draft: number | undefined,
  minimum: number,
  normalize: (value: number) => number,
  locked: boolean,
): number =>
  !locked && draft !== undefined
    ? draft
    : normalize(typeof stored === 'number' ? stored : minimum);
