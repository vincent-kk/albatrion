import { isPlainObject } from 'es-toolkit';

export function merge<
  T extends Record<PropertyKey, any>,
  S extends Record<PropertyKey, any>,
>(target: T, source: S): T & S {
  const sourceKeys = Object.keys(source) as Array<keyof S>;

  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i];

    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      if (Array.isArray(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge([], sourceValue);
      }
    } else if (isPlainObject(sourceValue)) {
      if (isPlainObject(targetValue)) {
        target[key] = merge(targetValue, sourceValue);
      } else {
        target[key] = merge({}, sourceValue);
      }
    } else if (targetValue === undefined || sourceValue !== undefined) {
      target[key] = sourceValue;
    }
  }

  return target;
}
