import { isObject } from './isObject';

/**
 * 값이 비어있는 객체인지 확인하는 함수
 * 객체에 속성이 없으면 비어있는 객체로 간주
 * @param value - 확인할 값
 * @returns 값이 비어있는 객체이면 true, 아니면 false
 */
export const isEmptyObject = (value: unknown): value is object => {
  if (!isObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
