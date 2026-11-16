import { removeDotSegments } from './utils/removeDotSegments';

/** RFC 3986 Appendix B; groups 2, 4, 5, 7 and 9 are the scheme, authority, path, query and fragment. */
const uriParts = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

/**
 * Resolve a scheme-less reference against a base the URL parser cannot use (RFC 3986 5.2.2, 5.3).
 * @param reference Percent-encoded written reference without a scheme.
 * @param base Empty, relative or opaque base, such as `schemas/root.json` or `urn:example:root`.
 * @returns The target: relative when the base has no scheme, normalized by the URL parser when it
 *   has one, and undefined when the parser rejects that result.
 */
export function resolveRelative(
  reference: string,
  base: string,
): string | undefined {
  const [, , , , authority, path = '', , query, , fragment] =
    uriParts.exec(reference) ?? [];
  const [, , scheme, , baseAuthority, basePath = '', , baseQuery] =
    uriParts.exec(base) ?? [];
  const targetAuthority = authority ?? baseAuthority;
  let targetPath = basePath,
    targetQuery = query ?? baseQuery;
  if (authority !== undefined || path !== '') {
    targetQuery = query;
    const merged =
      authority !== undefined || path.startsWith('/')
        ? path
        : mergePaths(basePath, path, baseAuthority !== undefined);
    targetPath = removeDotSegments(
      merged,
      scheme === undefined && baseAuthority === undefined,
    );
    // Without a scheme or authority, an empty path names the base document (RFC 3986 5.2.2), and a
    // first-segment colon, a leading `//` or a leading `/` left by an empty segment reads as a
    // scheme, an authority or a root (4.2); a leading dot segment keeps the written meaning.
    if (scheme === undefined && targetAuthority === undefined) {
      if (merged.startsWith('/')) {
        if (targetPath.startsWith('//')) targetPath = '/.' + targetPath;
      } else if (
        targetPath === '' ||
        targetPath.startsWith('/') ||
        /^[^/]*:/.test(targetPath)
      )
        targetPath = './' + targetPath;
    }
  }
  const target =
    (targetAuthority === undefined ? '' : '//' + targetAuthority) +
    targetPath +
    (targetQuery === undefined ? '' : '?' + targetQuery) +
    (fragment === undefined ? '' : '#' + fragment);
  if (scheme === undefined) return target;
  try {
    return new URL(scheme + ':' + target).href;
  } catch {
    return undefined;
  }
}

/**
 * Merge a relative path with the base path (RFC 3986 5.2.3).
 * @param basePath Path of the base.
 * @param path Non-empty relative path that does not start with `/`.
 * @param authority Whether the base has an authority, under which an empty path merges as `/`.
 * @returns The base path up to its last `/`, followed by the relative path.
 */
function mergePaths(
  basePath: string,
  path: string,
  authority: boolean,
): string {
  if (authority && basePath === '') return '/' + path;
  return basePath.slice(0, basePath.lastIndexOf('/') + 1) + path;
}
