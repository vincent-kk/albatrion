import { isArray } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { FlattenCondition } from '../flattenConditions';

/**
 * 스키마 조건을 분석하여 특정 값에 대해 어떤 속성이 필수인지 결정하는 함수를 반환합니다.
 * 조건 분석은 함수 생성 시점에 수행되어 클로저에 저장됩니다.
 * @param value 현재 객체 값
 * @param conditions 평탄화된 조건 배열
 * @returns 키를 받아 해당 키가 필수인지 반환하는 함수
 */
export const requiredFactory = (
  value: Dictionary,
  conditions: FlattenCondition[] | null,
): ((key: string) => boolean) | null => {
  if (!conditions) return null;
  const requiredFields = new Set<string>();

  for (const { condition, required, inverse } of conditions) {
    let matches = true;
    for (const [key, conditionValue] of Object.entries(condition)) {
      requiredFields.add(key);
      const currentValue = value[key];
      if (isArray(conditionValue))
        matches = conditionValue.includes(currentValue);
      else matches = conditionValue === currentValue;
      if (!matches) break;
    }
    if (inverse) matches = !matches;
    if (matches) {
      for (const field of required) requiredFields.add(field);
    }
  }
  return (key: string) => requiredFields.has(key);
};
