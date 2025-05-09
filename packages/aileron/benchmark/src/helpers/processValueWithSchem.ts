import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수
 *
 * @param value 원본 객체 값
 * @param schema 객체 스키마 정의
 * @param oneOfIndex oneOf 중 선택된 스키마의 인덱스 (없거나 -1 미만이면 oneOf 필드 모두 제거)
 * @param conditions 필터링에 사용할 조건들 (없으면 필터링하지 않음)
 * @returns 스키마와 조건에 맞게 필터링된 객체 값
 */
export const processValueWithSchema = (
  value: Dictionary | undefined,
  fieldConditionMap: FieldConditionMap | undefined,
  oneOfKeySet?: Set<string>,
  allowedKeySet?: Set<string>,
): Dictionary | undefined => {
  if (value == null || (!fieldConditionMap && !oneOfKeySet)) return value;

  const inputKeys = Object.keys(value);
  if (!inputKeys.length) return value;

  const isRequired = requiredFactory(value, fieldConditionMap);
  const filteredValue: Dictionary = {};
  for (let i = 0; i < inputKeys.length; i++) {
    const key = inputKeys[i];
    if (isRequired && !isRequired(key)) continue;
    if (oneOfKeySet && oneOfKeySet.has(key) && !allowedKeySet?.has(key))
      continue;
    filteredValue[key] = value[key];
  }
  return filteredValue;
};

type FieldConditionMap = Map<
  string,
  | Array<{
      condition: Dictionary<string | string[]>;
      inverse?: boolean;
    }>
  | true
>;

/**
 * 스키마 조건을 분석하여 특정 값에 대해 어떤 속성이 필수인지 결정하는 함수를 반환합니다.
 * @param value 현재 객체 값
 * @param fieldConditionMap 필드별 조건 Map
 * @returns 키를 받아 해당 키가 필수인지 반환하는 함수
 */
const requiredFactory = (
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
