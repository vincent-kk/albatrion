/** Grammar positions used by the shared CSS token and EOF model. */
export const enum CssContext {
  /** Between rules. */
  RuleList,
  /** A qualified rule's prelude. */
  Selector,
  /** An at-rule's prelude. */
  AtPrelude,
  /** Between declarations or nested rules. */
  DeclarationList,
  /** A declaration name or a nested selector before its block. */
  DeclarationName,
  /** A declaration's component-value sequence. */
  Value,
  /** A function prelude or attribute whose inner grammar is not interpreted by the compressor. */
  OpaquePrelude,
}
