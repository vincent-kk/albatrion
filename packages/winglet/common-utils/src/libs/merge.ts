import { isArray, isPlainObject } from '@/common-utils/utils/filter';

export const merge = <
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(
  target: T,
  source: S,
): T & S => {
  const sourceKeys = Object.keys(source) as Array<keyof S>;
  const length = sourceKeys.length;
  for (let i = 0; i < length; i++) {
    const key = sourceKeys[i];
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isArray(sourceValue)) {
      target[key] = isArray(targetValue)
        ? merge(targetValue, sourceValue)
        : merge([], sourceValue);
    } else if (isPlainObject(sourceValue)) {
      target[key] = isPlainObject(targetValue)
        ? merge(targetValue, sourceValue)
        : merge({}, sourceValue);
    } else if (targetValue === undefined || sourceValue !== undefined) {
      target[key] = sourceValue;
    }
  }
  return target;
};
