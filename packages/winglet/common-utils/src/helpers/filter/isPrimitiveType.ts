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
