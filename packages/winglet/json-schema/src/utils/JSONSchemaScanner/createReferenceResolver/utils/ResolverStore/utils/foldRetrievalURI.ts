import { dotSegment, foldableShape } from './retrievalURIPatterns';

/**
 * Spell a retrieval key as resolution writes it when only the letter case of its scheme and host differs.
 * @param uri Registered key as the caller wrote it.
 * @returns The key with its scheme and host lowercased when that spelling is canonical and contains
 *   no `xn--` anywhere; undefined otherwise, which leaves the key to the URL parser.
 */
export function foldRetrievalURI(uri: string): string | undefined {
  if (!foldableShape.test(uri) || dotSegment.test(uri)) return;
  // The host is not empty, so the slash that starts the path comes after `http://`.
  const path = uri.indexOf('/', 8);
  const folded = uri.slice(0, path).toLowerCase() + uri.slice(path);
  return folded.includes('xn--') ? undefined : folded;
}
