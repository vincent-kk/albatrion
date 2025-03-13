import {
  counterFactory,
  generateHash,
  isArray,
  isDate,
  isFunction,
  isPlainObject,
  isPrimitiveObject,
  isRegex,
  isUndefined,
  weakMapCacheFactory,
} from '@winglet/common-utils';

const { get, set } = weakMapCacheFactory<string>();
const { increment } = counterFactory();

export const stableSerialize = (
  input: unknown,
  omitKeys?: string[],
): string => {
  const omit = omitKeys ? new Set(omitKeys) : null;
  const omitHash = omitKeys
    ? generateHash(omitKeys?.join(',')).toString(36)
    : '';
  return createHash(input, omit, omitHash);
};

const createHash = (
  input: unknown,
  omit: Set<string> | null,
  omitHash: string,
): string => {
  if (isPrimitiveObject(input) && !isDate(input) && !isRegex(input)) {
    let result = get(input);
    // if (result && (!omitHash || result.startsWith(omitHash))) return result;

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

  return JSON.stringify(input);
};
