import { isBlob } from './isBlob';

const File = globalThis.File;

/**
 * 값이 File 객체인지 확인합니다.
 * File API가 정의되지 않은 환경(예: Node.js 구버전)에서는
 * 이 함수는 항상 false를 반환합니다.
 *
 * @param value 확인할 값
 * @returns 값이 File 객체이면 true, 아니면 false
 */
export const isFile = (value: unknown): value is File =>
  // File 생성자가 존재하는지 확인하고, isBlob 결과가 참이며,
  // 값이 File의 인스턴스인지 확인합니다.
  File !== undefined && isBlob(value) && value instanceof File;
