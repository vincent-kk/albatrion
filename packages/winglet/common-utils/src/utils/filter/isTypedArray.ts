/**
 * Function to check if a value is a TypedArray
 * @param value - Value to check
 * @returns true if the value is a TypedArray, false otherwise
 */
export const isTypedArray = <T extends TypedArray>(
  value: unknown,
): value is T => ArrayBuffer.isView(value) && !(value instanceof DataView);

export type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | Float32Array
  | Float64Array;
