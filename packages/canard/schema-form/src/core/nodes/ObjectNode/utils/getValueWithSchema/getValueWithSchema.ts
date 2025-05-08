import type { ObjectValue } from '@/schema-form/types';

import type { FieldConditionMap } from '../getFieldConditionMap';
import { requiredFactory } from './utils/requiredFactory';

/**
 * 주어진 값과 스키마를 기반으로 필요한 데이터를 추출하는 함수
 *
 * @param value 원본 객체 값
 * @param schema 객체 스키마 정의
 * @param oneOfIndex oneOf 중 선택된 스키마의 인덱스 (없거나 -1 미만이면 oneOf 필드 모두 제거)
 * @param conditions 필터링에 사용할 조건들 (없으면 필터링하지 않음)
 * @returns 스키마와 조건에 맞게 필터링된 객체 값
 */
export const getValueWithSchema = (
  value: ObjectValue | undefined,
  fieldConditionMap: FieldConditionMap | undefined,
  oneOfKeySet?: Set<string>,
  allowedKeySet?: Set<string>,
): ObjectValue | undefined => {
  if (value == null || (!fieldConditionMap && !oneOfKeySet)) return value;

  const inputKeys = Object.keys(value);
  if (!inputKeys.length) return value;

  const isRequired = requiredFactory(value, fieldConditionMap);
  const filteredValue: ObjectValue = {};

  for (let i = 0; i < inputKeys.length; i++) {
    const key = inputKeys[i];
    if (isRequired && !isRequired(key)) continue;
    if (oneOfKeySet && oneOfKeySet.has(key) && !allowedKeySet?.has(key))
      continue;
    filteredValue[key] = value[key];
  }
  return filteredValue;
};
