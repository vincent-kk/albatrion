import type { JsonSchema } from '@lumy/schema-form/types';

/**
 * @description JSON Schema의 default 속성 또는 타입에 따른 기본값 반환
 * @param jsonSchema - JSON Schema
 * @returns 기본값
 */
export const getFallbackValue = <Schema extends JsonSchema>(
  jsonSchema: Schema,
) => {
  if (jsonSchema.default !== undefined) return jsonSchema.default;
  else if (jsonSchema.type === 'array') return ArrayFallbackValue;
  else if (jsonSchema.type === 'virtual') return ArrayFallbackValue;
  else if (jsonSchema.type === 'object') return ObjectFallbackValue;
  else return undefined;
};

const ArrayFallbackValue: any[] = [];
const ObjectFallbackValue: Dictionary = {};
