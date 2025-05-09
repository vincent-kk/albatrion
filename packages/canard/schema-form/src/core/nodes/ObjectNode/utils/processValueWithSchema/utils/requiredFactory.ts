import { isArray } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { FieldConditionMap } from '../../getFieldConditionMap';

/**
 * 스키마 조건을 분석하여 특정 값에 대해 어떤 속성이 필수인지 결정하는 함수를 반환합니다.
 * @param value 현재 객체 값
 * @param fieldConditionMap 필드별 조건 Map
 * @returns 키를 받아 해당 키가 필수인지 반환하는 함수
 */
export const requiredFactory = (
  value: Dictionary,
  fieldConditionMap: FieldConditionMap | undefined,
): ((key: string) => boolean) | null => {
  if (!fieldConditionMap) return null;

  return (key: string): boolean => {
    const conditions = fieldConditionMap.get(key);
    if (!conditions) return false;
    if (conditions === true) return true;
    for (let i = 0; i < conditions.length; i++) {
      const { condition, inverse } = conditions[i];
      let matches = true;
      const condKeys = Object.keys(condition);
      if (condKeys.length === 1) {
        const condKey = condKeys[0];
        const condValue = condition[condKey];
        const currentValue = value[condKey];
        if (isArray(condValue)) matches = condValue.includes(currentValue);
        else matches = condValue === currentValue;
      } else {
        // 다중 조건 일반 경로
        for (const [condKey, condValue] of Object.entries(condition)) {
          const currentValue = value[condKey];
          if (isArray(condValue)) matches = condValue.includes(currentValue);
          else matches = condValue === currentValue;
          if (!matches) break;
        }
      }
      if (inverse) matches = !matches;
      if (matches) return true;
    }
    return false;
  };
};
