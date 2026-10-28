/** Parsed operators cannot alias literal property names. */
export const PointerOperator = {
  Wildcard: Symbol('pointer.wildcard'),
  Parent: Symbol('pointer.parent'),
  Current: Symbol('pointer.current'),
  Context: Symbol('pointer.context'),
} as const;

export type PointerOperator =
  (typeof PointerOperator)[keyof typeof PointerOperator];
export type PointerSegment = string | PointerOperator;
