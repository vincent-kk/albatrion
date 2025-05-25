/**
 * Function to check if a value is a primitive data object
 * @param value - Value to check
 * @returns true if the value is a primitive data object, false otherwise
 */
export const isPrimitiveObject = <T extends object>(
  value: unknown,
): value is T => {
  return Object(value) === value;
};
