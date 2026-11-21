/** Native typed-array brand getter, unaffected by an object's own toStringTag. */
const typedArrayBrand = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag,
)!.get!;

/** Tests the ArrayBuffer slot before passing an unknown object to a native constructor. */
const isForeignArrayBuffer = (value: unknown): value is ArrayBuffer => {
  if (Object.prototype.toString.call(value) !== '[object ArrayBuffer]') return false;
  try {
    Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength')!.get!.call(value);
    return true;
  } catch { return false; }
};

/**
 * Normalizes supported byte values missed by this realm's instanceof checks.
 * @param input - A possible byte view or buffer from another realm
 * @returns A zero-copy byte view, or null when the input is unsupported
 */
export const normalizeForeignBytes = (input: unknown): Uint8Array | null => {
  if (ArrayBuffer.isView(input) && typedArrayBrand.call(input) === 'Uint8Array')
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  return isForeignArrayBuffer(input) ? new Uint8Array(input) : null;
};
