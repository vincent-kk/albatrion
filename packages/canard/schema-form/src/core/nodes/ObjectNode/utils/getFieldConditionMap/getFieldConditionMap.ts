import type { FlattenCondition } from '../flattenConditions';

export type FieldConditionMap = Map<
  string,
  Array<Pick<FlattenCondition, 'condition' | 'inverse'>>
>;
/**
 * FlattenCondition[]을 필드별로 정제하여, 각 필드가 required가 되는 조건(및 inverse 여부) 배열을 반환합니다.
 * @param conditions FlattenCondition[]
 * @returns Map<필드명, Array<{ condition, inverse }>>
 */
export const getFieldConditionMap = (
  conditions: FlattenCondition[] | undefined,
): FieldConditionMap | undefined => {
  if (!conditions) return undefined;
  const fieldConditionMap: FieldConditionMap = new Map();
  for (let i = 0; i < conditions.length; i++) {
    const { condition, required, inverse } = conditions[i];
    for (let j = 0; j < required.length; j++) {
      const field = required[j];
      if (!fieldConditionMap.has(field)) fieldConditionMap.set(field, []);
      fieldConditionMap.get(field)!.push({ condition, inverse });
    }
  }
  return fieldConditionMap;
};
