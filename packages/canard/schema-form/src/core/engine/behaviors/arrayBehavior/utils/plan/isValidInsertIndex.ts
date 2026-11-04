/**
 * Accept an integer insertion position from the front up to and including the end.
 * @param index - Caller position to inspect
 * @param length - Current array length; equal to it addresses the tail like push
 * @returns Whether the position lies in [0, length]; negative, fractional, and overflow are absent
 */
export const isValidInsertIndex = (index: number, length: number): boolean =>
  Number.isInteger(index) && index >= 0 && index <= length;
