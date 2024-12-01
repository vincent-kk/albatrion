/**
 * @description Truthy 값 체크, Boolean 체크와 동일한 기능
 * @param value - 값
 * @returns Truthy 값인 경우 true, 그렇지 않은 경우 false
 */
export const isTruthy = <T>(
  value: T,
): value is Exclude<T, false | null | undefined | '' | 0> => Boolean(value);
