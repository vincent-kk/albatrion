/**
 * The canonical retrieval shape with the scheme and host in any ASCII letter case; without the
 * unicode flag, case-insensitive matching never pairs a non-ASCII character with an ASCII letter.
 */
const foldableShape =
  /^https?:\/\/(?:[a-z0-9-]+\.)*[a-z][a-z0-9-]*\/[A-Za-z0-9\-._~!$&'()*+,;=:@/]*$/i;
/** A `.` or `..` path segment, which resolution removes. */
const dotSegment = /\/\.\.?(?:\/|$)/;

/**
 * Spell a retrieval key as resolution writes it when only the letter case of its scheme and host differs.
 * @param uri Registered key as the caller wrote it.
 * @returns The key with its scheme and host lowercased when that spelling is canonical and holds no
 *   `xn--` label; undefined otherwise, which leaves the key to the URL parser.
 */
export function foldRetrievalURI(uri: string): string | undefined {
  if (!foldableShape.test(uri) || dotSegment.test(uri)) return;
  // The host is not empty, so the slash that starts the path comes after `http://`.
  const path = uri.indexOf('/', 8);
  const folded = uri.slice(0, path).toLowerCase() + uri.slice(path);
  return folded.includes('xn--') ? undefined : folded;
}
