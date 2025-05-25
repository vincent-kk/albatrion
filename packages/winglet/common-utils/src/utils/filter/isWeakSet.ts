/**
 * Function to check if a value is a WeakSet object
 * @param value - Value to check
 * @returns true if the value is a WeakSet object, false otherwise
 */
export const isWeakSet = <T extends WeakSet<any>>(value: unknown): value is T =>
  value instanceof WeakSet;
