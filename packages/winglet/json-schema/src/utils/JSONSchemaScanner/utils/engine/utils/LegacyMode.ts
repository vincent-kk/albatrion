/** How a draft-07 or earlier node with `$ref` treats the keywords beside the reference. */
export const enum LegacyMode {
  /** The node is not such a reference node; keywords follow their descriptor masks. */
  None,
  /** The reference stays in place: sibling children are inert, except under `definitions` and `$defs`. */
  ReferenceKept,
  /** The reference was inlined behind an `allOf` wrapper: `definitions` and `$defs` stay schema positions. */
  Wrapped,
}
