/**
 * 값이 정수인지 확인하는 함수
 * Number.isInteger의 타입을 확장한 별칭
 * @param value - 확인할 값
 * @returns 값이 정수이면 true, 아니면 false
 */
export const isInteger = Number.isInteger as (
  value?: unknown,
) => value is number;
