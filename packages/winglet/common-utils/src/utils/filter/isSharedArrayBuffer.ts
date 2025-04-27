const SharedArrayBuffer = globalThis.SharedArrayBuffer;

/**
 * 값이 SharedArrayBuffer 객체인지 확인합니다.
 * SharedArrayBuffer API가 정의되지 않은 환경에서는
 * 이 함수는 항상 false를 반환합니다.
 *
 * @param value 확인할 값
 * @returns 값이 SharedArrayBuffer 객체이면 true, 아니면 false
 */
export const isSharedArrayBuffer = (
  value: unknown,
): value is SharedArrayBuffer =>
  // SharedArrayBuffer 생성자가 존재하는지 확인하고,
  // 값이 SharedArrayBuffer의 인스턴스인지 확인합니다.
  SharedArrayBuffer !== undefined && value instanceof SharedArrayBuffer;
