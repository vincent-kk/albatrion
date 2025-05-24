import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * 스키마 노드 관련 오류에 대한 오류 클래스입니다.
 * 노드 처리 과정에서 발생하는 이슈를 처리하기 위해 사용됩니다.
 */
export class SchemaNodeError extends BaseError {
  private static readonly __group__ = 'SCHEMA_NODE_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(SchemaNodeError.__group__, code, message, details);
    this.name = 'SchemaNodeError';
  }
}

/**
 * 주어진 오류가 SchemaNodeError 타입인지 확인합니다.
 * @param error - 확인할 오류 객체
 * @returns SchemaNodeError 타입인지 여부
 */
export const isSchemaNodeError = (error: unknown): error is SchemaNodeError =>
  error instanceof SchemaNodeError;
