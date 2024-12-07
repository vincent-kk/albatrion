import { EMPTY_ARRAY, EMPTY_OBJECT } from '@lumy-pack/common';

import type { JsonSchema } from '@/schema-form/types';

/**
 * @description JSON Schema의 default 속성 또는 타입에 따른 기본값 반환
 * @param jsonSchema - JSON Schema
 * @returns 기본값
 */
export const getFallbackValue = <Schema extends JsonSchema>(
  jsonSchema: Schema,
) => {
  if (jsonSchema.default !== undefined) return jsonSchema.default;
  else if (jsonSchema.type === 'array') return EMPTY_ARRAY;
  else if (jsonSchema.type === 'virtual') return EMPTY_ARRAY;
  else if (jsonSchema.type === 'object') return EMPTY_OBJECT;
  else return undefined;
};
