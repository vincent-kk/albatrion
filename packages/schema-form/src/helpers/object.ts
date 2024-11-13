import { isPlainObject } from 'es-toolkit';

type NonUndefined<T> = T extends undefined ? never : T;

export const removeUndefined = <T extends Record<string, any>>(
  obj: T,
): {
  [K in keyof T as T[K] extends undefined ? never : K]: NonUndefined<T[K]>;
} => {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) =>
        isPlainObject(value) ? [key, removeUndefined(value)] : [key, value],
      )
      .filter(([, value]) => value !== undefined),
  ) as any;
};
