import { isArray } from './isArray';

/**
 * 값이 비어있는 배열인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 비어있는 배열이면 true, 아니면 false
 */
export const isEmptyArray = (value: unknown): value is any[] =>
  isArray(value) && value.length === 0;
