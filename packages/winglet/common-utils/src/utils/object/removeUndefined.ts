import { isArray, isPlainObject } from '@/common-utils/utils/filter';

/**
 * @description 객체에서 undefined 속성 제거
 * @param object - 객체
 * @returns 속성이 undefined인 경우 제거된 객체
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
