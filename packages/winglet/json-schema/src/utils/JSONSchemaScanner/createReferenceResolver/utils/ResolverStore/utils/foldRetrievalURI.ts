import { isCanonicalRetrievalURI } from './isCanonicalRetrievalURI';

/** An http(s) scheme and an ASCII host in any letter case, through the slash that starts the path. */
const authority = /^https?:\/\/[a-z0-9.-]+\//i;

/**
 * Spell a retrieval key as resolution writes it when only the letter case of its scheme and host differs.
 * @param uri Registered key as the caller wrote it.
 * @returns The key with its scheme and host lowercased when that spelling is canonical and holds no
 *   `xn--` label; undefined otherwise, which leaves the key to the URL parser.
 */
export function foldRetrievalURI(uri: string): string | undefined {
  const prefix = authority.exec(uri)?.[0];
  if (prefix === undefined) return;
  const folded = prefix.toLowerCase() + uri.slice(prefix.length);
  return isCanonicalRetrievalURI(folded) && !folded.includes('xn--')
    ? folded
    : undefined;
}
