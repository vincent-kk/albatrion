import { counterFactory, weakMapCacheFactory } from '../../libs';
import {
  isArray,
  isDate,
  isFunction,
  isPlainObject,
  isPrimitiveObject,
  isRegex,
} from '../filter';

type CreateHashOptions = {
  omit: Set<string> | null;
  counter: ReturnType<typeof counterFactory>;
};

const cache = weakMapCacheFactory<WeakMap<object, string>>();

export const serialize = (input: unknown, omitKeys?: string[]): string => {
  const counter = counterFactory();
  const omit = omitKeys ? new Set(omitKeys) : null;
  return createHash(input, { counter, omit });
};

const createHash = (input: unknown, options: CreateHashOptions): string => {
  if (isPrimitiveObject(input) && !isDate(input) && !isRegex(input)) {
    let result = cache.get(input);
    if (result) return result;

    result = options.counter.increment() + '@';
    cache.set(input, result);

    if (isArray(input)) {
      const segments = ['#'];
      for (let index = 0; index < input.length; index++) {
        segments.push(createHash(input[index], options) + ',');
      }
      result = segments.join('');
    } else if (isPlainObject(input)) {
      const segments = ['%'];
      const keys = Object.keys(input).sort();
      for (const key of keys) {
        if (options.omit?.has(key)) continue;
        segments.push(key + ':' + createHash(input[key], options) + '|');
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
