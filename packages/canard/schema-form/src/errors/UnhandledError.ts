import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * 처리되지 않은 오류에 대한 오류 클래스입니다.
 * 응용 프로그램에서 처리되지 않은 예외를 캐치하고 표준화하기 위해 사용됩니다.
 */
export class UnhandledError extends BaseError {
  private static readonly __group__ = 'UNHANDLED_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(UnhandledError.__group__, code, message, details);
    this.name = 'UnhandledError';
  }
}

/**
 * 주어진 오류가 UnhandledError 타입인지 확인합니다.
 * @param error - 확인할 오류 객체
 * @returns UnhandledError 타입인지 여부
 */
export const isUnhandledError = (error: unknown): error is UnhandledError =>
  error instanceof UnhandledError;
