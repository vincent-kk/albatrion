/**
 * 값이 TypedArray인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 TypedArray이면 true, 아니면 false
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
