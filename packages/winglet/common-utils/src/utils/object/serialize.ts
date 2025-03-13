import { counterFactory, weakMapCacheFactory } from '../../libs';
import {
  isArray,
  isDate,
  isFunction,
  isPlainObject,
  isPrimitiveObject,
  isRegex,
  isUndefined,
} from '../filter';

const cache = weakMapCacheFactory<WeakMap<object, string>>();
const counter = counterFactory();

export const serialize = (input: unknown, omitKeys?: string[]): string => {
  const omit = omitKeys ? new Set(omitKeys) : null;
  return createHash(input, omit);
};

const createHash = (input: unknown, omit: Set<string> | null): string => {
  if (isPrimitiveObject(input) && !isDate(input) && !isRegex(input)) {
    let result = cache.get(input);
    if (result) return result;

    result = counter.increment() + '@';
    cache.set(input, result);

    if (isArray(input)) {
      const segments = ['#'];
      for (let index = 0; index < input.length; index++) {
        segments.push(createHash(input[index], omit) + ',');
      }
      result = segments.join('');
    } else if (isPlainObject(input)) {
      const segments = ['%'];

      const keys = Object.keys(input).sort();
      let key: string;
      while (!isUndefined((key = keys.pop() as string))) {
        if (omit?.has(key)) continue;
        segments.push(key + ':' + createHash(input[key], omit) + '|');
      }

      result = segments.join('');
    }
    cache.set(input, result);
    return result;
  }

  if (isDate(input)) return input.toJSON();

  if (isFunction(input?.toString)) return input.toString();

  return JSON.stringify(input);
};
