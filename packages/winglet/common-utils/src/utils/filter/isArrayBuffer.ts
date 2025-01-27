export const isArrayBuffer = (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer;
