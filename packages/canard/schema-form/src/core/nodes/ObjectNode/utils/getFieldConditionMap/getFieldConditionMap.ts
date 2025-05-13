import type { Dictionary } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

import { flattenConditions } from './utils/flattenConditions';

export type FieldConditionMap = Map<
  string,
  | Array<{
      condition: Dictionary<string | string[]>;
      inverse?: boolean;
    }>
  | true
>;
/**
 * jsonSchema를 필드별로 정제하여, 각 필드가 required가 되는 조건(및 inverse 여부) 배열을 반환합니다.
 * @param jsonSchema jsonSchema
 * @returns Map<필드명, Array<{ condition, inverse }>> | true
 */
export const getFieldConditionMap = (
  jsonSchema: JsonSchema,
): FieldConditionMap | undefined => {
  const conditions = flattenConditions(jsonSchema);
  if (!conditions) return undefined;
  const fieldConditionMap: FieldConditionMap = new Map();
  for (let i = 0; i < conditions.length; i++) {
    const { condition, required, inverse } = conditions[i];
    // 1. required 필드 처리 (기존과 동일)
    for (let j = 0; j < required.length; j++) {
      const field = required[j];
      const previous = fieldConditionMap.get(field);
      if (previous === true) continue; // 이미 true면 skip
      if (!previous) fieldConditionMap.set(field, [{ condition, inverse }]);
      else previous.push({ condition, inverse });
    }
    // 2. condition에만 등장하는 필드 처리
    for (const key of Object.keys(condition))
      if (!required.includes(key)) fieldConditionMap.set(key, true);
  }
  return fieldConditionMap;
};
