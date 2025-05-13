import { hasOwnProperty } from './hasOwnProperty';

/**
 * 객체 또는 배열의 키(인덱스 또는 프로퍼티 이름)를 배열로 반환하는 함수
 * 배열, 객체 및 기타 값 유형에 대해 동작
 * @template Value - 키를 추출할 값의 타입
 * @param value - 키를 추출할 값
 * @returns 값에서 추출한 키들의 배열
 */
export const getKeys = <Value>(value: Value) => {
  // 배열인 경우 인덱스를 문자열로 반환
  if (Array.isArray(value)) {
    const keys = new Array(value.length);
    for (let k = 0; k < keys.length; k++) keys[k] = '' + k;
    return keys;
  }
  if (value && typeof value === 'object') return Object.keys(value);
  const keys = [];
  for (const key in value)
    if (hasOwnProperty(value, key)) keys[keys.length] = key;
  return keys;
};
