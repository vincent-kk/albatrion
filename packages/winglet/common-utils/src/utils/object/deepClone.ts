import {
  isArray,
  isArrayBuffer,
  isBlob,
  isBuffer,
  isCloneable,
  isPrimitiveType,
  isSharedArrayBuffer,
  isTypedArray,
} from '@/common-utils/utils/filter';

import { getSymbols } from './getSymbols';

export const deepClone = <Type>(target: Type): Type => clone(target);

const clone = <Type>(value: Type, cache = new WeakMap<object, any>()): Type => {
  if (isPrimitiveType(value)) return value as Type;

  // @ts-expect-error: After passing `isPrimitiveType`, value must be an object.
  if (cache.has(value)) return cache.get(value) as Type;

  if (isArray(value)) {
    const result = new Array(value.length);
    cache.set(value, result);
    for (let i = 0; i < value.length; i++)
      if (i in value) result[i] = clone(value[i], cache);
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
    for (const [k, v] of value) result.set(clone(k, cache), clone(v, cache));
    return result as Type;
  }

  if (value instanceof Set) {
    const result = new Set();
    cache.set(value, result);
    for (const v of value) result.add(clone(v, cache));
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
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    const result = new File([value], value.name, {
      type: value.type,
      lastModified: value.lastModified,
    });
    cache.set(value, result);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (isBlob(value)) {
    const result = new Blob([value], { type: value.type });
    cache.set(value, result);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (value instanceof Error) {
    const result = new (value.constructor as { new (...args: any[]): Error })();
    cache.set(value, result);
    result.message = value.message;
    result.name = value.name;
    result.stack = value.stack;
    // @ts-expect-error: The `cause` property is not available on Error prior to ES2022.
    if ('cause' in value) result.cause = clone(value.cause, cache);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (typeof value === 'object' && isCloneable(value)) {
    const result = Object.create(Object.getPrototypeOf(value));
    // `isCloneable` will not allow a nullish object to be passed.
    cache.set(value!, result);
    copyProperties(result, value!, cache);
    return result as Type;
  }

  return value;
};

const copyProperties = (
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
        target[key] = clone(source[key], cache);
    }
  const symbols = getSymbols(source);
  if (symbols.length > 0)
    for (let i = 0; i < symbols.length; i++) {
      const key = symbols[i];
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor == null || descriptor.writable)
        target[key] = clone(source[key], cache);
    }
};
