import { isArray, isPlainObject } from '@/common-utils/utils/filter';

/**
 * 두 객체를 깊은 수준까지 병합합니다.
 * 소스 객체의 속성은 대상 객체의 속성을 덮어씁니다.
 * 두 객체 모두 중첩된 객체나 배열을 가진 경우 재귀적으로 병합합니다.
 *
 * @template T - 대상 객체 타입
 * @template S - 소스 객체 타입
 * @param target - 병합 대상 객체
 * @param source - 병합할 소스 객체
 * @returns 병합된 객체
 *
 * @example
 * merge({a: 1, b: {c: 2}}, {b: {d: 3}, e: 4}); // {a: 1, b: {c: 2, d: 3}, e: 4}
 * merge({a: [1, 2]}, {a: [3, 4]}); // {a: [1, 2, 3, 4]}
 */
export const merge = <
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(
  target: T,
  source: S,
): T & S => {
  const keys = Object.keys(source) as Array<keyof S>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isArray(sourceValue))
      target[key] = isArray(targetValue)
        ? merge(targetValue, sourceValue)
        : merge([], sourceValue);
    else if (isPlainObject(sourceValue))
      target[key] = isPlainObject(targetValue)
        ? merge(targetValue, sourceValue)
        : merge({}, sourceValue);
    else if (targetValue === undefined || sourceValue !== undefined)
      target[key] = sourceValue;
  }
  return target;
};
