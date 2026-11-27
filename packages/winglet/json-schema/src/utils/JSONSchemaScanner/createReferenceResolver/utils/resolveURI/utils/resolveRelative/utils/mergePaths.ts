/**
 * Merge a relative path with the base path (RFC 3986 5.2.3).
 * @param basePath Path of the base.
 * @param path Non-empty relative path that does not start with `/`.
 * @param authority Whether the base has an authority, under which an empty path merges as `/`.
 * @returns The base path up to its last `/`, followed by the relative path.
 */
export function mergePaths(
  basePath: string,
  path: string,
  authority: boolean,
): string {
  if (authority && basePath === '') return '/' + path;
  return basePath.slice(0, basePath.lastIndexOf('/') + 1) + path;
}
