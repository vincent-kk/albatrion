/**
 * Derive a row's bootstrap seed from its key so that rows resample along different, reproducible streams.
 * The hash is 32-bit FNV-1a over the key's UTF-16 code units; a zero result maps to 1 because xorshift
 * cannot leave the zero state.
 * @param key - Row key such as `if-then/off/update-first`; a confirmation pass appends `#confirm`
 * @returns Unsigned 32-bit seed, never zero
 */
export function rowSeed129(key) {
  let state = 0x811c9dc5;
  for (let index = 0; index < key.length; index++) {
    state ^= key.charCodeAt(index);
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  return state || 1;
}
