/**
 * Function to check if a value is a Promise
 * @param value - Value to check
 * @returns true if the value is a Promise, false otherwise
 */
export const isPromise = <T extends Promise<any>>(value: unknown): value is T =>
  value instanceof Promise;
