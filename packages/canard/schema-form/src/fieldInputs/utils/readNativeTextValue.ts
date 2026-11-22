/**
 * Map a native text edit to the stored value of a built-in text input.
 * @param value - Current DOM value for a string or date input.
 * @returns Undefined on a clear edit, or the text unchanged.
 */
export const readNativeTextValue = (value: string): string | undefined =>
  value === '' ? undefined : value;
