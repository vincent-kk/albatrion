/**
 * Reads supported foreign value types without accepting forged slotless brands.
 * @param value - Non-plain object not recognized by local prototype identity
 * @returns A content key for a genuine Date or RegExp, otherwise undefined
 */
export const readForeignFingerprint = (value: object): string | undefined => {
  try {
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Date]') return 'Date(' + Date.prototype.getTime.call(value) + ')';
    if (tag === '[object RegExp]') {
      Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')!.get!.call(value);
      return String(value);
    }
  } catch { return undefined; }
  return undefined;
};
