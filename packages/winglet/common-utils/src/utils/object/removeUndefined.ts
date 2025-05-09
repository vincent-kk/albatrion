import { isArray, isPlainObject } from '@/common-utils/utils/filter';

/**
 * 객체나 배열에서 undefined 값을 가진 속성을 제거합니다.
 * 중첩된 객체와 배열을 재귀적으로 처리합니다.
 *
 * @template Type - 입력 값의 타입
 * @param input - undefined 값을 제거할 객체 또는 배열
 * @returns undefined 값이 제거된 새로운 객체 또는 배열
 *
 * @example
 * removeUndefined({a: 1, b: undefined, c: {d: undefined, e: 2}}); // {a: 1, c: {e: 2}}
 * removeUndefined([1, undefined, 2]); // [1, 2]
 * removeUndefined([1, {a: undefined, b: 2}, 3]); // [1, {b: 2}, 3]
 */
export const removeUndefined = <Type>(input: Type): Type => {
  if (isArray(input)) {
    const result = [] as typeof input;
    for (let i = 0; i < input.length; i++) {
      const item = removeUndefined(input[i]);
      if (item !== undefined) result.push(item);
    }
    return result;
  }
  if (isPlainObject(input)) {
    const result = {} as typeof input;
    const keys = Object.keys(input) as Array<keyof Type>;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = removeUndefined(input[key] as object);
      if (value !== undefined) (result as any)[key] = value;
    }
    return result;
  }
  return input;
};
