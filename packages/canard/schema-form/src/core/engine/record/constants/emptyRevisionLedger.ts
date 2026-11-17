/** Shared ledger until an occurrence first receives a committed event. */
export const EMPTY_REVISION_LEDGER: Readonly<Record<number, number>> =
  // eslint-disable-next-line no-restricted-syntax -- Identity sentinel compared by reference.
  Object.freeze({});
