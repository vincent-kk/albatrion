import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * 스키마 폼 관련 오류에 대한 기반 오류 클래스입니다.
 * 폼 처리 과정에서 발생하는 이슈를 처리하기 위해 사용됩니다.
 */
export class SchemaFormError extends BaseError {
  private static readonly __group__ = 'SCHEMA_FORM_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(SchemaFormError.__group__, code, message, details);
    this.name = 'SchemaFormError';
  }
}

/**
 * 주어진 오류가 SchemaFormError 타입인지 확인합니다.
 * @param error - 확인할 오류 객체
 * @returns SchemaFormError 타입인지 여부
 */
export const isSchemaFormError = (error: unknown): error is SchemaFormError =>
  error instanceof SchemaFormError;
