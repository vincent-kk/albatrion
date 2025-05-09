/**
 * 값이 숫자인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 숫자이면 true, 아니면 false
 */
export const isNumber = (value?: unknown): value is number =>
  typeof value === 'number';
