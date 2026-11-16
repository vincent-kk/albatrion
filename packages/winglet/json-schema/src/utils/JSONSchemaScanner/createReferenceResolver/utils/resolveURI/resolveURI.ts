import { resolveRelative } from './utils/resolveRelative/resolveRelative';

/** RFC 3986 scheme syntax, required of the text before a colon that precedes any `/`, `?` or `#`. */
const SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*$/;

/**
 * Resolve a written reference or identifier by RFC 3986 section 5.2 under any base.
 * @param reference Written value. C0 controls, spaces and backslashes are percent-encoded first:
 *   the URL parser deletes or rewrites them, so one string would name different targets under
 *   different bases.
 * @param base Enclosing address: hierarchical (`https:`), opaque (`urn:`, `tag:`), relative, or
 *   empty for an unknown default base.
 * @returns The target, which stays relative while the base is empty or relative; undefined when
 *   the text before the first colon is not a scheme or the URL parser rejects the result.
 */
export function resolveURI(
  reference: string,
  base: string,
): string | undefined {
  const written = encodeUnsafe(reference);
  const delimiter = written.search(/[:/?#]/);
  const scheme = delimiter >= 0 && written[delimiter] === ':';
  if (scheme && !SCHEME.test(written.slice(0, delimiter))) return undefined;
  try {
    if (isHierarchical(base)) return new URL(written, base).href;
    if (scheme) return new URL(written).href;
  } catch {
    return undefined;
  }
  return resolveRelative(written, base);
}

/**
 * Percent-encode what the URL parser deletes or rewrites: C0 controls, space and backslash.
 * @param reference Written value.
 * @returns The value with each such character as an uppercase `%XX` escape.
 */
function encodeUnsafe(reference: string): string {
  let written = '';
  for (const character of reference)
    written +=
      character > ' ' && character !== '\\'
        ? character
        : '%' +
          character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
  return written;
}

/**
 * Tell whether the URL parser can resolve against a base.
 * @param base Enclosing address.
 * @returns True when the base parses with an authority or a path starting with `/`; false for an
 *   empty, relative or opaque base such as `urn:example:root`.
 */
function isHierarchical(base: string): boolean {
  try {
    const url = new URL(base);
    return url.host !== '' || url.pathname.startsWith('/');
  } catch {
    return false;
  }
}
