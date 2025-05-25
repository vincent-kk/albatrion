/**
 * Function to check if a value is a Set object
 * @param value - Value to check
 * @returns true if the value is a Set object, false otherwise
 */
export const isSet = <T extends Set<any>>(value: unknown): value is T =>
  value instanceof Set;
