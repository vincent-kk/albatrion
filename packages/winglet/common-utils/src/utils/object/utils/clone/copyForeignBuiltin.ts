import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/**
 * Creates a shallow built-in shell after validating its native internal slots.
 * @param value - Object missed by this realm's constructor checks
 * @returns A usable shell, or undefined for ordinary objects and forged slotless tags
 */
export const copyForeignBuiltin = (value: object): object | undefined => {
  const tag = getTypeTag(value);
  if (tag === '[object Error]') {
    const aggregate = Reflect.get(value, 'name') === 'AggregateError';
    const copy = Reflect.construct(value.constructor, aggregate
      ? [[], Reflect.get(value, 'message')]
      : [Reflect.get(value, 'message')]);
    Reflect.set(copy, 'stack', Reflect.get(value, 'stack'));
    if (Object.prototype.hasOwnProperty.call(value, 'name'))
      Reflect.set(copy, 'name', Reflect.get(value, 'name'));
    return copy;
  }
  try {
    switch (tag) {
      case '[object Date]': return new Date(Date.prototype.getTime.call(value));
      case '[object Map]': Map.prototype.has.call(value, undefined); return new Map();
      case '[object Set]': Set.prototype.has.call(value, undefined); return new Set();
      case '[object RegExp]': {
        const source = Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')!.get!.call(value);
        const copy = new RegExp(source, Reflect.get(value, 'flags'));
        copy.lastIndex = Reflect.get(value, 'lastIndex');
        return copy;
      }
      case '[object ArrayBuffer]': return ArrayBuffer.prototype.slice.call(value, 0);
      case '[object SharedArrayBuffer]': return SharedArrayBuffer.prototype.slice.call(value, 0);
      case '[object DataView]': {
        const buffer = Object.getOwnPropertyDescriptor(DataView.prototype, 'buffer')!.get!.call(value);
        const offset = Object.getOwnPropertyDescriptor(DataView.prototype, 'byteOffset')!.get!.call(value);
        const length = Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength')!.get!.call(value);
        return new DataView(buffer.slice(), offset, length);
      }
      default: return undefined;
    }
  } catch {
    return undefined;
  }
};
