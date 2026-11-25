/** `Map.prototype.size` getter; throws for a receiver without Map state. */
const readMapSize = takeGetter(Map.prototype, 'size');

/** `Set.prototype.size` getter; throws for a receiver without Set state. */
const readSetSize = takeGetter(Set.prototype, 'size');

/** `RegExp.prototype.source` getter; throws for a receiver without RegExp state. */
const readRegExpSource = takeGetter(RegExp.prototype, 'source');

/** `ArrayBuffer.prototype.byteLength` getter; throws for a receiver without buffer state. */
const readByteLength = takeGetter(ArrayBuffer.prototype, 'byteLength');

/** `Error.isError` where the runtime provides it; the package's ES2020 type library does not declare it. */
const isError: ((value: unknown) => boolean) | undefined = Reflect.get(
  Error,
  'isError',
);

/**
 * Checks that an object holds the internal state its `Object.prototype.toString` tag names.
 * Each check reads one slot through this realm's built-in, which accepts that built-in from any
 * realm and its subclasses, and fails for an object that only claims the tag through
 * `Symbol.toStringTag`.
 * @param value - Object whose `Object.prototype.toString` result is `tag`.
 * @param tag - The `Object.prototype.toString` result for `value`.
 * @returns Whether content comparison may read the built-in state the tag names. An
 *   `[object Error]` tag passes unchecked on runtimes without `Error.isError`; any tag outside
 *   the checked built-ins passes only for a typed array or DataView.
 */
export const hasBuiltinSlots = (value: object, tag: string): boolean => {
  try {
    if (tag === '[object Date]') Date.prototype.getTime.call(value);
    else if (tag === '[object Map]') readMapSize.call(value);
    else if (tag === '[object Set]') readSetSize.call(value);
    else if (tag === '[object RegExp]') readRegExpSource.call(value);
    else if (tag === '[object Number]') Number.prototype.valueOf.call(value);
    else if (tag === '[object String]') String.prototype.valueOf.call(value);
    else if (tag === '[object Boolean]') Boolean.prototype.valueOf.call(value);
    else if (tag === '[object ArrayBuffer]') readByteLength.call(value);
    else if (tag === '[object Error]')
      return isError === undefined || isError(value);
    else return ArrayBuffer.isView(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Takes a built-in accessor's getter once at module load.
 * @param prototype - Built-in prototype that declares the accessor.
 * @param key - Accessor name.
 * @returns The getter, callable on any receiver.
 * @throws {TypeError} When the runtime lacks the accessor.
 */
function takeGetter(prototype: object, key: string): () => unknown {
  const getter = Object.getOwnPropertyDescriptor(prototype, key)?.get;
  if (getter === undefined) throw new TypeError(`Missing accessor: ${key}`);
  return getter;
}
