/** Option-derived choices shared by every call using one effective-schema memo result. */
export interface StaticChoices {
  /** Whether an empty scalar or object is absent from output. */
  readonly omitEmpty: boolean;
  /** Whether the trailing run of null, undefined, empty-string, empty-array and empty-plain-object positions is excluded. */
  readonly omitTrailingEmpty: boolean;
  /** Whether completed string input loses surrounding whitespace. */
  readonly trim: boolean;
  /** Emitted object key order ahead of authored declarations; it does not change the on-screen order. */
  readonly propertyOrder: readonly string[];
}
