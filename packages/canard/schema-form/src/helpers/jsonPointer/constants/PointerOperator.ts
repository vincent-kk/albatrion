/** Parsed operators are unique symbols, so they cannot alias literal property names. */
export const PointerOperator = {
  /** The raw segment `*`: any array item. */
  Wildcard: Symbol('pointer.wildcard'),
  /** The raw segment `..`: the parent of the current location. */
  Parent: Symbol('pointer.parent'),
  /** The raw segment `.`: the current location. */
  Current: Symbol('pointer.current'),
  /** The raw segment `@`: the form context. */
  Context: Symbol('pointer.context'),
} as const;

/** One of the four operator symbols. */
export type PointerOperator =
  (typeof PointerOperator)[keyof typeof PointerOperator];
/** A decoded name, or an operator symbol. */
export type PointerSegment = string | PointerOperator;
