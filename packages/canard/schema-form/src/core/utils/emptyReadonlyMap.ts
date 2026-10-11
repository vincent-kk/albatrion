/** Shared immutable iterator source for feature absence results. */
const EMPTY_ENTRIES: readonly never[] = Object.freeze([]);

/** Read-only empty map facade; no native mutable map is exposed or allocated. */
export const emptyReadonlyMap: ReadonlyMap<never, never> = Object.freeze({
  size: 0,
  get: () => undefined,
  has: () => false,
  forEach: () => undefined,
  entries: () => EMPTY_ENTRIES.values(),
  keys: () => EMPTY_ENTRIES.values(),
  values: () => EMPTY_ENTRIES.values(),
  [Symbol.iterator]: () => EMPTY_ENTRIES.values(),
});
