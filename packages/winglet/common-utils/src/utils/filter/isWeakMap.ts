/**
 * Function to check if a value is a WeakMap object
 * @param value - Value to check
 * @returns true if the value is a WeakMap object, false otherwise
 */
export const isWeakMap = <T extends WeakMap<any, any>>(
  value: unknown,
): value is T => value instanceof WeakMap;
