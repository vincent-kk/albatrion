/** Fields of one component frame in the shared grammar stack. */
export const enum CssFrame {
  /** Bits used by the matching ASCII closing punctuation. */
  CloseMask = 127,
  /** Marks a rule block rather than a prelude/value component. */
  RuleBlock = 128,
  /** Parent grammar position begins above the punctuation flags. */
  ContextShift = 8,
}
