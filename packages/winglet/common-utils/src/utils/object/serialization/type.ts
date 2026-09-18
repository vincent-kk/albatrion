/** Recursive property-exclusion policy for graph storage. */
export interface SerializationOptions {
  /** Own enumerable property names omitted recursively before reading values. */
  omit?: readonly string[] | ReadonlySet<string>;
}
