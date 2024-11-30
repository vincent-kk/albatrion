/**
 * @description Truthy 값 체크, Boolean 체크와 동일한 기능
 * @param value - 값
 * @returns Truthy 값인 경우 true, 그렇지 않은 경우 false
 */
export const isTruthy = <T>(
  value: T,
): value is Exclude<T, false | null | undefined | '' | 0> => Boolean(value);

export const isFunction = <Params extends Array<any>, Return>(
  content: unknown,
): content is Fn<Params, Return> => typeof content === 'function';

export function isPlainObject(
  value: unknown,
): value is Record<PropertyKey, any> {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;

  if (!hasObjectPrototype) return false;
  return Object.prototype.toString.call(value) === '[object Object]';
}
export const isArray = (value?: unknown): value is any[] =>
  Array.isArray(value);

export const isEmptyObject = (value: unknown): value is object =>
  isPlainObject(value) && Object.keys(value).length === 0;

export const isString = (value?: unknown): value is string =>
  typeof value === 'string';

export const isNumber = (value?: unknown): value is number =>
  typeof value === 'number';

export const isBoolean = (value?: unknown): value is boolean =>
  typeof value === 'boolean';

export const isNull = (value?: unknown): value is null => value === null;

export const isUndefined = (value?: unknown): value is undefined =>
  value === undefined;
