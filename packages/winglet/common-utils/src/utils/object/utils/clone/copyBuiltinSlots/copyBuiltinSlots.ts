import { constructBuiltin } from '../constructBuiltin';
import { copyForeignError } from './utils/copyForeignError';

/**
 * Creates the native shell of a subclass or a built-in from another realm.
 * @param value Value from the clone dispatcher.
 * @param tag Dispatcher's built-in tag.
 * @param prototype Original prototype for a subclass already identified locally.
 * @returns A usable shell, or undefined when a foreign tag has no native slots.
 */
export const copyBuiltinSlots = (
  value: object,
  tag: string,
  prototype?: object | null,
): object | undefined => {
  if (tag === '[object Error]') return copyForeignError(value);
  try {
    switch (tag) {
      case '[object Date]':
        return constructBuiltin(
          Date,
          [Date.prototype.getTime.call(value)],
          prototype === undefined ? Object.getPrototypeOf(value) : prototype,
        );
      case '[object Map]':
        if (prototype === undefined) Map.prototype.has.call(value, undefined);
        return constructBuiltin(
          Map,
          [],
          prototype === undefined ? Object.getPrototypeOf(value) : prototype,
        );
      case '[object Set]':
        if (prototype === undefined) Set.prototype.has.call(value, undefined);
        return constructBuiltin(
          Set,
          [],
          prototype === undefined ? Object.getPrototypeOf(value) : prototype,
        );
      case '[object RegExp]': {
        const source = Object.getOwnPropertyDescriptor(
          RegExp.prototype,
          'source',
        )!.get!.call(value);
        const copy = constructBuiltin(
          RegExp,
          [source, Reflect.get(value, 'flags')],
          prototype === undefined ? Object.getPrototypeOf(value) : prototype,
        );
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
  } catch (error) {
    if (prototype !== undefined) throw error;
    return undefined;
  }
};
