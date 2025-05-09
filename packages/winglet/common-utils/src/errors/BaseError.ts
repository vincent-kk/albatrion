export type ErrorDetails = Record<string, unknown>;

export abstract class BaseError extends Error {
  /** 에러 그룹 식별자 */
  public readonly group: string;
  /** 에러 특정 코드 */
  public readonly specific: string;
  /** 전체 에러 코드 (`${group}.${specific}` 형태) */
  public readonly code: string;
  /** 에러 관련 추가 정보 */
  public readonly details: ErrorDetails;

  /**
   * BaseError 생성자
   * @param group - 에러 그룹 식별자
   * @param specific - 에러 특정 코드
   * @param message - 에러 메시지
   * @param details - 에러 관련 추가 정보
   */
  constructor(
    group: string,
    specific: string,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(message);
    this.group = group;
    this.specific = specific;
    this.code = `${group}.${specific}`;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
