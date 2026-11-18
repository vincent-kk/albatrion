import { copyForeignError } from './utils/copyForeignError';

/**
 * Creates a built-in shell from native slots or a recognized Error prototype lineage.
 * @param value - Object missed by this realm's constructor checks
 * @param tag - Type tag already read by the clone dispatcher
 * @returns A usable shell, or undefined for ordinary objects and forged slotless tags
 */
export const copyForeignBuiltin = (
  value: object,
  tag: string,
): object | undefined => {
  if (tag === '[object Error]') return copyForeignError(value);
  try {
    switch (tag) {
      case '[object Date]':
        return new Date(Date.prototype.getTime.call(value));
      case '[object Map]':
        Map.prototype.has.call(value, undefined);
        return new Map();
      case '[object Set]':
        Set.prototype.has.call(value, undefined);
        return new Set();
      case '[object RegExp]': {
        const source = Object.getOwnPropertyDescriptor(
          RegExp.prototype,
          'source',
        )!.get!.call(value);
        const copy = new RegExp(source, Reflect.get(value, 'flags'));
        copy.lastIndex = Reflect.get(value, 'lastIndex');
        return copy;
      }
      case '[object ArrayBuffer]':
        return ArrayBuffer.prototype.slice.call(value, 0);
      case '[object SharedArrayBuffer]':
        return SharedArrayBuffer.prototype.slice.call(value, 0);
      case '[object DataView]': {
        const buffer = Object.getOwnPropertyDescriptor(
          DataView.prototype,
          'buffer',
        )!.get!.call(value);
        const offset = Object.getOwnPropertyDescriptor(
          DataView.prototype,
          'byteOffset',
        )!.get!.call(value);
        const length = Object.getOwnPropertyDescriptor(
          DataView.prototype,
          'byteLength',
        )!.get!.call(value);
        return new DataView(buffer.slice(), offset, length);
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
};
