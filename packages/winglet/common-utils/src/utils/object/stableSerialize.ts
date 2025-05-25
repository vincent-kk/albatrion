import { weakMapCacheFactory } from '@/common-utils/libs/cache';
import { counterFactory } from '@/common-utils/libs/counter';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isDate } from '@/common-utils/utils/filter/isDate';
import { isFunction } from '@/common-utils/utils/filter/isFunction';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';
import { isPrimitiveObject } from '@/common-utils/utils/filter/isPrimitiveObject';
import { isRegex } from '@/common-utils/utils/filter/isRegex';
import { isUndefined } from '@/common-utils/utils/filter/isUndefined';
import { Murmur3 } from '@/common-utils/utils/hash';

import { serializeNative } from './serializeNative';

const { get, set } = weakMapCacheFactory<string>();
const { increment } = counterFactory();

/**
 * Stably serializes an object. Identical objects are always serialized to the same string.
 * Can also serialize objects with circular references.
 *
 * @param input - Value to serialize
 * @param omit - Set or array of property keys to exclude from serialization (optional)
 * @returns Serialized string
 *
 * @example
 * stableSerialize({a: 1, b: 2}); // '{b:2|a:1}'
 * stableSerialize({a: 1, b: {c: 3}}); // '{b:{c:3}|a:1}'
 * stableSerialize([1, 2, 3]); // '[1,2,3]'
 */
export const stableSerialize = (
  input: unknown,
  omit?: Set<string> | Array<string>,
): string => {
  const omitSet = omit ? (omit instanceof Set ? omit : new Set(omit)) : null;
  const omitKeys = omit ? (isArray(omit) ? omit : Array.from(omit)) : null;
  const omitHash = omitKeys
    ? Murmur3.hash(omitKeys.join(',')).toString(36)
    : '';
  return createHash(input, omitSet, omitHash);
};

/**
 * Creates a stably hashed string for the given value.
 *
 * @param input - Value to hash
 * @param omit - Set of property keys to exclude from hashing
 * @param omitHash - Hash prefix for excluded keys
 * @returns Hashed string
 */
const createHash = (
  input: unknown,
  omit: Set<string> | null,
  omitHash: string,
): string => {
  if (isPrimitiveObject(input) && !isDate(input) && !isRegex(input)) {
    let result = get(input);
    if (result && (!omitHash || result.startsWith(omitHash))) return result;

    result = `${omitHash}${increment()}@`;
    set(input, result);

    if (isArray(input)) {
      const segments = [];
      for (let index = 0; index < input.length; index++) {
        segments[segments.length] = createHash(input[index], omit, omitHash);
      }
      result = `${omitHash}[${segments.join(',')}]`;
    } else if (isPlainObject(input)) {
      const segments = [];
      const keys = Object.keys(input).sort();
      let key: string;
      while (!isUndefined((key = keys.pop() as string))) {
        if (omit?.has(key)) continue;
        segments[segments.length] =
          key + ':' + createHash(input[key], omit, omitHash);
      }
      result = `${omitHash}{${segments.join('|')}}`;
    }
    set(input, result);
    return result;
  }

  if (isDate(input)) return input.toJSON();

  if (isFunction(input?.toString)) return input.toString();

  return serializeNative(input);
};
