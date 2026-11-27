/** One bit per supported dialect, so a keyword's dialect set is a mask tested without URI parsing. */
export const enum DialectFlag {
  /** JSON Schema draft-04. */
  Draft04 = 1 << 0,
  /** JSON Schema draft-06. */
  Draft06 = 1 << 1,
  /** JSON Schema draft-07. */
  Draft07 = 1 << 2,
  /** JSON Schema 2019-09. */
  Draft201909 = 1 << 3,
  /** JSON Schema 2020-12. */
  Draft202012 = 1 << 4,
}

/** Sets of dialect bits that the engine tests as a group. */
export const enum DialectMask {
  /** Dialects in which keywords beside `$ref` are ignored (draft-07 and earlier). */
  Legacy = DialectFlag.Draft04 | DialectFlag.Draft06 | DialectFlag.Draft07,
  /** Every supported dialect; the mask of a keyword that declares no dialect set. */
  All = Legacy | DialectFlag.Draft201909 | DialectFlag.Draft202012,
}
