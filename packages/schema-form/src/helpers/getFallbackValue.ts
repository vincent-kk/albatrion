import type { JsonSchema } from '@lumy/schema-form/types';

/**
 * @description JSON Schema의 default 속성 또는 타입에 따른 기본값 반환
 * @param jsonSchema - JSON Schema
 * @returns 기본값
 */
export const getFallbackValue = <Schema extends JsonSchema>(
  jsonSchema: Schema,
) =>
  jsonSchema.default ??
  (jsonSchema.type === 'object'
    ? {}
    : jsonSchema.type === 'array'
      ? []
      : undefined);
