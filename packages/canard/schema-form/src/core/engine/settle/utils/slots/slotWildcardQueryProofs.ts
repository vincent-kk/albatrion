/** Rare compatibility proofs contain Boolean query results, never retained values. */
export const slotWildcardQueryProofs = new WeakMap<
  object,
  ReadonlyMap<string, boolean>
>();

/** A complete escaped segment equal to star keeps navigation's wildcard meaning. */
export const hasSlotWildcardPath = (path: string): boolean =>
  /(?:^|\/)\*(?:\/|$)/.test(path);

/** Live wildcard scopes reconsider query membership once at their first read per commit. */
export const slotWildcardReadCommits = new WeakMap<object, number>();
