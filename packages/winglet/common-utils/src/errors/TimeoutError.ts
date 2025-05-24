import { BaseError, type ErrorDetails } from './BaseError';

/**
 * 작업이 지정된 시간 내에 완료되지 않았을 때 발생하는 오류
 * 시간 제한이 있는 비동기 작업에서 사용됨
 */
export class TimeoutError extends BaseError {
  private static readonly __group__ = 'TIMEOUT';
  /**
   * TimeoutError 생성자
   * @param code - 구체적인 오류 코드
   * @param message - 오류 메시지
   * @param details - 오류 관련 추가 정보
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(TimeoutError.__group__, code, message, details);
    this.name = 'Timeout';
  }
}

/**
 * 주어진 오류가 TimeoutError 인지 확인하는 타입 가드 함수
 * @param error - 확인할 오류 객체
 * @returns error가 TimeoutError 인지 여부
 */
export const isTimeoutError = (error: unknown): error is TimeoutError =>
  error instanceof TimeoutError;
