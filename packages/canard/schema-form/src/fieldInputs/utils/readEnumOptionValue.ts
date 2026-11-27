/**
 * Resolve a built-in choice's DOM value back to its authored enum value.
 * @param options - Choices in declaration order, preserving raw values such as null.
 * @param value - Selected text from the native control.
 * @returns First matching raw value, or undefined when no option matches.
 */
export const readEnumOptionValue = <Value>(
  options: readonly { value: string; rawValue: Value }[],
  value: string,
): Value | undefined => options.find((option) => option.value === value)?.rawValue;
