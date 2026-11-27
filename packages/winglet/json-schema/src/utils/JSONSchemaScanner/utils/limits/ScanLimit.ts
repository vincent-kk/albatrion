/** Fixed bounds of a scan; the two reference bounds are the defaults of the `limits` option. */
export const enum ScanLimit {
  /** Depth from which ancestry is checked for a physical cycle; ordinary schemas never reach it, so they pay nothing. */
  CycleCheckMinDepth = 256,
  /** Replacements one position may follow when `limits.referenceChain` is not given. */
  ReferenceChain = 32,
  /** Schema nodes one scan may inline when `limits.inlinedNodes` is not given. */
  InlinedNodes = 1_000_000,
}
