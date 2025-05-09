import type {
  ArraySchema,
  BooleanSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  UnknownSchema,
} from './types/jsonSchema';

/**
 * 스키마가 배열 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns 배열 스키마인지 여부
 */
export const isArraySchema = (schema: UnknownSchema): schema is ArraySchema =>
  schema.type === 'array';

/**
 * 스키마가 숫자 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns 숫자 스키마인지 여부
 */
export const isNumberSchema = (schema: UnknownSchema): schema is NumberSchema =>
  schema.type === 'number';

/**
 * 스키마가 객체 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns 객체 스키마인지 여부
 */
export const isObjectSchema = (schema: UnknownSchema): schema is ObjectSchema =>
  schema.type === 'object';

/**
 * 스키마가 문자열 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns 문자열 스키마인지 여부
 */
export const isStringSchema = (schema: UnknownSchema): schema is StringSchema =>
  schema.type === 'string';

/**
 * 스키마가 불리언 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns 불리언 스키마인지 여부
 */
export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema => schema.type === 'boolean';

/**
 * 스키마가 null 타입인지 확인합니다.
 * @param schema 검사할 JSON 스키마
 * @returns null 스키마인지 여부
 */
export const isNullSchema = (schema: UnknownSchema): schema is NullSchema =>
  schema.type === 'null';
