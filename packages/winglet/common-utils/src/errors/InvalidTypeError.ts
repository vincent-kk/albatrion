import { BaseError, type ErrorDetails } from './BaseError';

/**
 * 유효하지 않은 타입이 발견되었을 때 발생하는 오류
 * 타입 검증이나 형변환 과정에서 발생할 수 있음
 */
export class InvalidTypeError extends BaseError {
  static readonly #group = 'INVALID_TYPE';
  /**
   * InvalidTypeError 생성자
   * @param code - 구체적인 오류 코드
   * @param message - 오류 메시지
   * @param details - 오류 관련 추가 정보
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(InvalidTypeError.#group, code, message, details);
    this.name = 'InvalidType';
  }
}

/**
 * 주어진 오류가 InvalidTypeError 인지 확인하는 타입 가드 함수
 * @param error - 확인할 오류 객체
 * @returns error가 InvalidTypeError 인지 여부
 */
export const isInvalidTypeError = (error: unknown): error is InvalidTypeError =>
  error instanceof InvalidTypeError;
