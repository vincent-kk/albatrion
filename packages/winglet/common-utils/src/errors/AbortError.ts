import { BaseError, type ErrorDetails } from './BaseError';

/**
 * 작업이 취소되었을 때 발생하는 오류
 * AbortController 또는 수동 취소에 의해 발생할 수 있음
 */
export class AbortError extends BaseError {
  static readonly #group = 'ABORT';
  /**
   * AbortError 생성자
   * @param code - 구체적인 오류 코드
   * @param message - 오류 메시지
   * @param details - 오류 관련 추가 정보
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(AbortError.#group, code, message, details);
    this.name = 'Abort';
  }
}

/**
 * 주어진 오류가 AbortError 인지 확인하는 타입 가드 함수
 * @param error - 확인할 오류 객체
 * @returns error가 AbortError 인지 여부
 */
export const isAbortError = (error: unknown): error is AbortError =>
  error instanceof AbortError;
