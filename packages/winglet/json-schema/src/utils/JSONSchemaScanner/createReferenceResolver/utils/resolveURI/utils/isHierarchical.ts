/**
 * Tell whether the URL parser can resolve against a base.
 * @param base Enclosing address.
 * @returns True when the base parses with an authority or a path starting with `/`; false for an
 *   empty, relative or opaque base such as `urn:example:root`.
 */
export function isHierarchical(base: string): boolean {
  try {
    const url = new URL(base);
    return url.host !== '' || url.pathname.startsWith('/');
  } catch {
    return false;
  }
}
