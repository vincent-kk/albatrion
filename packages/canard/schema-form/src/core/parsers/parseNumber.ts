/**
 * Parses input value to number format.
 * @param value - Value to parse
 * @param isInteger - Whether to return integer
 * @returns Parsed number value or undefined if parsing is impossible
 */
export const parseNumber = (
  value: unknown,
  isInteger: boolean,
): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    if (isNaN(value)) return NaN;
    return isInteger ? ~~value : value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d-.]/g, ''));
    if (isNaN(parsed)) return NaN;
    return isInteger ? ~~parsed : parsed;
  }
  return NaN;
};
