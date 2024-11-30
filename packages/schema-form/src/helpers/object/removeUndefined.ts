import { isPlainObject } from '@lumy/schema-form/helpers/filter';

type NonUndefined<T> = T extends undefined ? never : T;

/**
 * @description 객체에서 undefined 속성 제거
 * @param object - 객체
 * @returns 속성이 undefined인 경우 제거된 객체
 */
export const removeUndefined = <T extends Record<string, any>>(
  object: T,
): {
  [K in keyof T as T[K] extends undefined ? never : K]: NonUndefined<T[K]>;
} => {
  return Object.fromEntries(
    Object.entries(object)
      .map(([key, value]) =>
        isPlainObject(value) ? [key, removeUndefined(value)] : [key, value],
      )
      .filter(([, value]) => value !== undefined),
  ) as any;
};
