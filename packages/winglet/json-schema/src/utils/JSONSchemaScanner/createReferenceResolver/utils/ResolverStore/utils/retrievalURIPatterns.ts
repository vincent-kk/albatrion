/**
 * Lowercase http(s) scheme, a named host whose last label starts with a letter (so the URL parser
 * never reads it as an IPv4 address), no userinfo or port, and a non-empty path of characters the
 * URL parser keeps as written with no `.` or `..` segment, which resolution removes; query,
 * fragment and percent-encoding are excluded.
 */
export const canonicalShape =
  /^https?:\/\/(?:[a-z0-9-]+\.)*[a-z][a-z0-9-]*(?:\/(?!\.\.?(?:\/|$))[A-Za-z0-9\-._~!$&'()*+,;=:@]*)+$/;

/**
 * The canonical shape with the scheme and host in any ASCII letter case; without the unicode flag,
 * case-insensitive matching never pairs a non-ASCII character with an ASCII letter.
 */
export const foldableShape = new RegExp(canonicalShape.source, 'i');
