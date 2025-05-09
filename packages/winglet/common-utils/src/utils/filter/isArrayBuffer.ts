/**
 * 값이 ArrayBuffer 인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 ArrayBuffer이면 true, 아니면 false
 */
export const isArrayBuffer = (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer;
