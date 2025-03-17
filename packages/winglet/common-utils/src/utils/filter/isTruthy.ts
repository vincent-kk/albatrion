/**
 * @description Truthy 값 체크, Boolean 체크와 동일한 기능
 * @param value - 체크할 값
 * @returns value가 truthy 값인 경우 true, 그렇지 않은 경우 false
 */
export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => !!value;

export type Falsy = false | null | undefined | '' | 0;
