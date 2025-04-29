import { weakMapCacheFactory } from '@/common-utils/libs/cache';
import { counterFactory } from '@/common-utils/libs/counter';
import { isArray } from '@/common-utils/utils/filter/isArray';
import { isDate } from '@/common-utils/utils/filter/isDate';
import { isFunction } from '@/common-utils/utils/filter/isFunction';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';
import { isPrimitiveObject } from '@/common-utils/utils/filter/isPrimitiveObject';
import { isRegex } from '@/common-utils/utils/filter/isRegex';
import { isUndefined } from '@/common-utils/utils/filter/isUndefined';
import { generateHash } from '@/common-utils/utils/generateHash';

import { serializeNative } from './serializeNative';

const { get, set } = weakMapCacheFactory<string>();
const { increment } = counterFactory();

export const stableSerialize = (
  input: unknown,
  omit?: Set<string> | Array<string>,
): string => {
  const omitSet = omit ? (omit instanceof Set ? omit : new Set(omit)) : null;
  const omitKeys = omit ? (isArray(omit) ? omit : Array.from(omit)) : null;
  const omitHash = omitKeys
    ? generateHash(omitKeys.join(',')).toString(36)
    : '';
  return createHash(input, omitSet, omitHash);
};

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
        segments.push(createHash(input[index], omit, omitHash));
      }
      result = `${omitHash}[${segments.join(',')}]`;
    } else if (isPlainObject(input)) {
      const segments = [];
      const keys = Object.keys(input).sort();
      let key: string;
      while (!isUndefined((key = keys.pop() as string))) {
        if (omit?.has(key)) continue;
        segments.push(key + ':' + createHash(input[key], omit, omitHash));
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
