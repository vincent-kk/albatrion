import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * 유효성 검증 관련 오류에 대한 오류 클래스입니다.
 * 폼 데이터의 유효성 검증 중 발생하는 오류를 처리하기 위해 사용됩니다.
 */
export class ValidationError extends BaseError {
  static readonly #group = 'VALIDATION_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(ValidationError.#group, code, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 주어진 오류가 ValidationError 타입인지 확인합니다.
 * @param error - 확인할 오류 객체
 * @returns ValidationError 타입인지 여부
 */
export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;
