/** Option-derived choices shared by every call using one effective-schema memo result. */
export interface StaticChoices {
  /** Whether an empty scalar or object is absent from output. */
  readonly omitEmpty: boolean;
  /** Whether nullish and unfilled trailing array positions are excluded. */
  readonly omitTrailing: boolean;
  /** Whether completed string input loses surrounding whitespace. */
  readonly trim: boolean;
  /** Emitted object key order ahead of authored declarations; it does not change the on-screen order. */
  readonly propertyOrder: readonly string[];
}
