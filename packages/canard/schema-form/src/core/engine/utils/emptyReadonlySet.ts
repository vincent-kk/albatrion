/** Shared immutable iterator source for absent feature memberships. */
const EMPTY_ENTRIES: readonly never[] = Object.freeze([]);

/** Read-only empty set facade; consumers can query but cannot mutate it. */
export const emptyReadonlySet: ReadonlySet<never> = Object.freeze({
  size: 0,
  has: () => false,
  forEach: () => undefined,
  entries: () => EMPTY_ENTRIES.values(),
  keys: () => EMPTY_ENTRIES.values(),
  values: () => EMPTY_ENTRIES.values(),
  [Symbol.iterator]: () => EMPTY_ENTRIES.values(),
});
