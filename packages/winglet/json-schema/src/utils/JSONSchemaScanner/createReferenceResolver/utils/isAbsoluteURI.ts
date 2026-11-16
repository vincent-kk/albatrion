/** RFC 3986 section 3.1: a letter, then letters, digits, `+`, `-` or `.`, then a colon. */
const schemePrefix = /^[A-Za-z][A-Za-z0-9+.-]*:/;

/**
 * Tell whether a URI reference starts with a scheme.
 * @param uri Written or resolved URI reference.
 * @returns True when the text before the first `:` is a scheme, which then holds no `/`, `?`
 *   or `#`; any other reference is relative to a base that may be unknown.
 */
export function isAbsoluteURI(uri: string): boolean {
  return schemePrefix.test(uri);
}
