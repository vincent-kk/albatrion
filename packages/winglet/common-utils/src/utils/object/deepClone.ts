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

  if (cache.has(value as object)) return cache.get(value as object) as Type;

  if (isArray(value)) {
    const result: any = new Array(value.length);
    cache.set(value as object, result);
    for (let i = 0; i < value.length; i++) result[i] = clone(value[i], cache);
    if ('index' in value) result.index = value.index;
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
    cache.set(value as object, result);
    for (const [k, v] of value) result.set(k, clone(v, cache));
    return result as Type;
  }

  if (value instanceof Set) {
    const result = new Set();
    cache.set(value as object, result);
    for (const v of value) result.add(clone(v, cache));
    return result as Type;
  }

  if (isBuffer(value)) return value.subarray() as Type;

  if (isTypedArray(value)) {
    const result = new (Object.getPrototypeOf(value).constructor)(value.length);
    cache.set(value as object, result);
    for (let i = 0; i < value.length; i++) result[i] = clone(value[i], cache);
    return result as Type;
  }

  if (isArrayBuffer(value) || isSharedArrayBuffer(value)) {
    return value.slice() as Type;
  }

  if (value instanceof DataView) {
    const result = new DataView(
      value.buffer.slice(),
      value.byteOffset,
      value.byteLength,
    );
    cache.set(value as object, result);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    const result = new File([value], value.name, {
      type: value.type,
    });
    cache.set(value as object, result);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (isBlob(value)) {
    const result = new Blob([value], { type: value.type });
    cache.set(value as object, result);
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (value instanceof Error) {
    const result = new (value.constructor as { new (): Error })();
    cache.set(value as object, result);
    result.message = value.message;
    result.name = value.name;
    result.stack = value.stack;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    result.cause = value.cause;
    copyProperties(result, value, cache);
    return result as Type;
  }

  if (typeof value === 'object' && isCloneable(value)) {
    const result = Object.create(Object.getPrototypeOf(value));
    cache.set(value as object, result);
    // isCloneable will not allow to pass nullish object
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
