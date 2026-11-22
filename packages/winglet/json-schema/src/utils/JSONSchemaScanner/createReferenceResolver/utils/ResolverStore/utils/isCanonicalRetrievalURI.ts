/**
 * Lowercase http(s) scheme, a named host whose last label starts with a letter (so the URL parser
 * never reads it as an IPv4 address), no userinfo or port, and a non-empty path of characters the
 * URL parser keeps as written; query, fragment and percent-encoding are excluded.
 */
const canonicalShape =
  /^https?:\/\/(?:[a-z0-9-]+\.)*[a-z][a-z0-9-]*\/[A-Za-z0-9\-._~!$&'()*+,;=:@/]*$/;
/** A `.` or `..` path segment, which resolution removes. */
const dotSegment = /\/\.\.?(?:\/|$)/;

/**
 * Tell whether resolving a retrieval key leaves its spelling unchanged.
 * @param uri Registered key as the caller wrote it.
 * @returns True only for spellings that resolution provably keeps; false may also cover keys
 *   that would resolve unchanged, which costs a normalization pass but never a wrong lookup.
 */
export function isCanonicalRetrievalURI(uri: string): boolean {
  return canonicalShape.test(uri) && !dotSegment.test(uri);
}
