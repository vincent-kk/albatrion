import { isArray } from '@/common-utils/utils/filter/isArray';
import { isArrayBuffer } from '@/common-utils/utils/filter/isArrayBuffer';
import { isBlob } from '@/common-utils/utils/filter/isBlob';
import { isBuffer } from '@/common-utils/utils/filter/isBuffer';
import { isCloneable } from '@/common-utils/utils/filter/isCloneable';
import { isPrimitiveType } from '@/common-utils/utils/filter/isPrimitiveType';
import { isSharedArrayBuffer } from '@/common-utils/utils/filter/isSharedArrayBuffer';
import { isTypedArray } from '@/common-utils/utils/filter/isTypedArray';

import { getSymbols } from './getSymbols';

/**
 * 값의 깊은 복제본을 생성합니다.
 * 원시 타입, 배열, 객체, Date, RegExp, Map, Set, TypedArray 등 다양한 타입을 지원합니다.
 * 순환 참조도 올바르게 처리합니다.
 *
 * @template Type - 복제할 값의 타입
 * @param target - 복제할 값
 * @returns 원본과 동일한 구조와 값을 가진 새로운 복제본
 *
 * @example
 * clone(123); // 123
 * clone('abc'); // 'abc'
 * clone({a: 1, b: {c: 2}}); // {a: 1, b: {c: 2}}
 * clone(new Date()); // 새로운 Date 객체
 */
export const clone = <Type>(target: Type): Type => replicate(target);

/**
 * 값을 재귀적으로 복제합니다.
 *
 * @template Type - 복제할 값의 타입
 * @param value - 복제할 값
 * @param cache - 이미 복제된 객체를 추적하는 WeakMap (순환 참조 처리)
 * @returns 복제된 값
 */
const replicate = <Type>(
  value: Type,
  cache = new WeakMap<object, any>(),
): Type => {
  if (isPrimitiveType(value)) return value as Type;

  // @ts-expect-error: After passing `isPrimitiveType`, value must be an object.
  if (cache.has(value)) return cache.get(value) as Type;

  if (isArray(value)) {
    const result = new Array(value.length);
    cache.set(value, result);
    for (let i = 0; i < value.length; i++)
      if (i in value) result[i] = replicate(value[i], cache);
    // @ts-expect-error: The `index` property is only available in the result of a RegExp match.
    if ('index' in value) result.index = value.index;
    // @ts-expect-error: The `input` property is only available in the result of a RegExp match.
    if ('input' in value) result.input = value.input;
    return result as Type;
  }

  if (value instanceof Date) return new Date(value.getTime()) as Type;

  if (value instanceof RegExp) {
    const result = new RegExp(value.source, value.flags);
    result.lastIndex = value.lastIndex;
    return result as Type;
  }

  if (value instanceof Map) {
    const result = new Map();
    cache.set(value, result);
    for (const [k, v] of value)
      result.set(replicate(k, cache), replicate(v, cache));
    return result as Type;
  }

  if (value instanceof Set) {
    const result = new Set();
    cache.set(value, result);
    for (const v of value) result.add(replicate(v, cache));
    return result as Type;
  }

  if (isBuffer(value)) return value.subarray() as Type;

  if (isTypedArray(value)) return value.slice() as Type;

  if (isArrayBuffer(value) || isSharedArrayBuffer(value))
    return value.slice() as Type;

  if (value instanceof DataView) {
    const result = new DataView(
      value.buffer.slice(),
      value.byteOffset,
      value.byteLength,
    );
    cache.set(value, result);
    replicateProperties(result, value, cache);
    return result as Type;
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    const result = new File([value], value.name, {
      type: value.type,
      lastModified: value.lastModified,
    });
    cache.set(value, result);
    replicateProperties(result, value, cache);
    return result as Type;
  }

  if (isBlob(value)) {
    const result = new Blob([value], { type: value.type });
    cache.set(value, result);
    replicateProperties(result, value, cache);
    return result as Type;
  }

  if (value instanceof Error) {
    const result = new (value.constructor as { new (...args: any[]): Error })();
    cache.set(value, result);
    result.message = value.message;
    result.name = value.name;
    result.stack = value.stack;
    // @ts-expect-error: The `cause` property is not available on Error prior to ES2022.
    if ('cause' in value) result.cause = replicate(value.cause, cache);
    replicateProperties(result, value, cache);
    return result as Type;
  }

  if (typeof value === 'object' && isCloneable(value)) {
    const result = Object.create(Object.getPrototypeOf(value));
    // `isCloneable` will not allow a nullish object to be passed.
    cache.set(value!, result);
    replicateProperties(result, value!, cache);
    return result as Type;
  }

  return value;
};

/**
 * 소스 객체의 모든 속성(문자열 키와 심볼 키 모두)을 대상 객체에 복사합니다.
 *
 * @param target - 속성을 복사할 대상 객체
 * @param source - 속성을 복사할 소스 객체
 * @param cache - 이미 복제된 객체를 추적하는 WeakMap
 */
const replicateProperties = (
  target: Record<PropertyKey, any>,
  source: Record<PropertyKey, any>,
  cache?: WeakMap<object, any>,
): void => {
  const keys = Object.keys(source);
  if (keys.length > 0)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor == null || descriptor.writable)
        target[key] = replicate(source[key], cache);
    }
  const symbols = getSymbols(source);
  if (symbols.length > 0)
    for (let i = 0; i < symbols.length; i++) {
      const key = symbols[i];
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor == null || descriptor.writable)
        target[key] = replicate(source[key], cache);
    }
};
