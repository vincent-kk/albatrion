/**
 * Function to check if a value is a Map object
 * @param value - Value to check
 * @returns true if the value is a Map object, false otherwise
 */
export const isMap = <T extends Map<any, any>>(value: unknown): value is T =>
  value instanceof Map;
