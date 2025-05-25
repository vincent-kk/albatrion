/**
 * Function to check if a value is a primitive type
 * @param value - Value to check
 * @returns true if the value is a primitive type, false otherwise
 */
export const isPrimitiveType = (value: unknown): value is PrimitiveType =>
  value == null || (typeof value !== 'object' && typeof value !== 'function');

export type PrimitiveType =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;
