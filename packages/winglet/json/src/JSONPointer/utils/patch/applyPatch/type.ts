/**
 * Options accepted by `applyPatch`.
 *
 * Reserved member safety is not configurable: reserved member names
 * (`__proto__`, `constructor`, `prototype`) are always handled as opaque own
 * data through the data-property primitives, so no option can expose the
 * prototype chain.
 */
export type ApplyPatchOptions = {
  /**
   * Has no effect. The `test` operation compares values with deep equality in
   * every mode and fails the patch application on mismatch (RFC 6902 4.6).
   * @deprecated The option is ignored; remove it from calls.
   */
  strict?: boolean;
  /**
   * Preserves the source document by cloning each changed path copy-on-write;
   * unchanged subtrees stay structurally shared with the source. When false,
   * the source is modified in place.
   * @default true
   */
  immutable?: boolean;
};
