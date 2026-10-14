/**
 * Detects whether a validator compile failure was caused by a circular schema graph.
 *
 * A recursive `$ref` is not this case — validators support recursive schemas and
 * compile them without complaint. What exhausts the stack is a schema whose object
 * graph loops (e.g. `schema.properties.self === schema`), which surfaces as a
 * `RangeError`. Engine wording differs (V8: "Maximum call stack size exceeded",
 * SpiderMonkey: "too much recursion"), so the message is matched loosely in
 * addition to the constructor check.
 *
 * Every other compile failure — contradictory keywords, unresolvable `$ref`,
 * malformed keyword shapes, invalid `pattern` regex, duplicate `$id` — is reported
 * under a single code with the validator's own message as the reason.
 *
 * @param error - Error thrown while compiling the schema
 */
export const isCircularReferenceError = (error: unknown): boolean => {
  if (error instanceof RangeError) return true;
  if (!(error instanceof Error)) return false;
  return /maximum call stack|too much recursion|circular/i.test(error.message);
};
