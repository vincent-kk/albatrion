/**
 * @description JSON Schema의 default 속성 또는 타입에 따른 기본값 반환
 * @param jsonSchema - JSON Schema
 * @returns 기본값
 */
export const getFallbackValue = <
  Schema extends { type?: string; default?: any },
>(
  jsonSchema: Schema,
) => {
  if (jsonSchema.default !== undefined) return jsonSchema.default;
  else if (jsonSchema.type === 'array') return [];
  else if (jsonSchema.type === 'virtual') return [];
  else if (jsonSchema.type === 'object') return {};
  else return undefined;
};
