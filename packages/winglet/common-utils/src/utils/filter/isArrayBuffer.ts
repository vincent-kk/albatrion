/**
 * Function to check if a value is an ArrayBuffer
 * @param value - Value to check
 * @returns true if the value is an ArrayBuffer, false otherwise
 */
export const isArrayBuffer = (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer;
