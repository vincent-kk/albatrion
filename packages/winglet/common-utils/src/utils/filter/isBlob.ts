const Blob = globalThis.Blob;

/**
 * 값이 Blob 객체인지 확인합니다.
 * Blob API가 정의되지 않은 환경(예: 구버전 Node.js)에서는
 * 이 함수는 항상 false를 반환합니다.
 *
 * @param value 확인할 값
 * @returns 값이 Blob 객체이면 true, 아니면 false
 */
export const isBlob = (value: unknown): value is Blob =>
  // Blob 생성자가 존재하는지 확인하고,
  // 값이 Blob의 인스턴스인지 확인합니다.
  Blob !== undefined && value instanceof Blob;
