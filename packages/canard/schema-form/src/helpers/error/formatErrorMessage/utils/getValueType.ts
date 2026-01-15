/**
 * Gets the type description of a value for error messages.
 * @param value - Value to describe
 * @returns Human-readable type description
 */
export const getValueType = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `array with ${value.length} elements`;
  return typeof value;
};
