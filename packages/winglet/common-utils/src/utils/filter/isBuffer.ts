const Buffer = globalThis.Buffer;

/**
 * 값이 Node.js Buffer인지 확인합니다.
 * global Buffer 객체가 정의되지 않은 브라우저 환경에서는
 * 이 함수는 항상 false를 반환합니다.
 *
 * @param value 확인할 값
 * @returns 값이 Node.js Buffer이면 true, 아니면 false
 */
export const isBuffer = (value: unknown): value is Buffer =>
  Buffer !== undefined && Buffer.isBuffer(value);
