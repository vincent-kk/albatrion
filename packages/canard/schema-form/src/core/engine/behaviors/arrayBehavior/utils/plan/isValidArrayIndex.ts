/**
 * Accept a current integer position; negative, fractional, and overflow are absent.
 * @param index - Caller position to inspect
 * @param length - Current array length bounding valid positions
 * @returns Whether an existing position is addressed
 */
export const isValidArrayIndex = (index: number, length: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < length;
