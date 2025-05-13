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
 * 객체를 안정적으로 직렬화합니다. 동일한 객체는 항상 동일한 문자열로 직렬화됩니다.
 * 순환 참조가 있는 객체도 직렬화할 수 있습니다.
 *
 * @param input - 직렬화할 값
 * @param omit - 직렬화에서 제외할 속성 키의 집합 또는 배열 (선택사항)
 * @returns 직렬화된 문자열
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
 * 주어진 값을 안정적으로 해시한 문자열을 생성합니다.
 *
 * @param input - 해시할 값
 * @param omit - 해시에서 제외할 속성 키의 집합
 * @param omitHash - 제외된 키들의 해시 프리픽스
 * @returns 해시된 문자열
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
