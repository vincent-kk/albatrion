import type { ObjectValue } from '@/schema-form/types';

/**
 * value에서 oneOf에 정의된 프로퍼티만 제거(properties의 키만 유지)
 * 아무 곳에도 정의되지 않은 프로퍼티는 그대로 유지
 *
 * @param value 원본 객체 값
 * @param schema 객체 스키마 정의
 * @returns oneOf에 정의된 프로퍼티가 제거된 객체 값
 */
export const removeOneOfProperties = (
  value: ObjectValue | undefined,
  oneOfKeySet?: Set<string>,
  allowedKeySet?: Set<string>,
): ObjectValue | undefined => {
  if (value == null || oneOfKeySet === undefined) return value;
  const result: ObjectValue = {};
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (oneOfKeySet.has(key) && !allowedKeySet?.has(key)) continue;
    result[key] = value[key];
  }
  return result;
};
