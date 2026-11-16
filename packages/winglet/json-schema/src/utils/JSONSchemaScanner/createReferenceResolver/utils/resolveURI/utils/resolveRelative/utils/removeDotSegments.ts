/**
 * Remove `.` and `..` segments with a segment stack (RFC 3986 5.2.4).
 * @param path Merged or written path.
 * @param climb Whether a `..` above the start of a path that does not start with `/` stays, so
 *   that the unknown default base of a document without an absolute address can complete it.
 * @returns The path without dot segments. A path starting with `/` never climbs above its root,
 *   a path that does not start with `/` never gains one, and a final `.` or `..` leaves a
 *   trailing `/`.
 */
export function removeDotSegments(path: string, climb: boolean): string {
  const rooted = path.startsWith('/');
  const segments = (rooted ? path.slice(1) : path).split('/');
  if (/^\.\.?$/.test(segments[segments.length - 1])) segments.push('');
  const output: string[] = [];
  for (const segment of segments) {
    if (segment === '.') continue;
    if (segment !== '..') output.push(segment);
    else if (output.length && output[output.length - 1] !== '..') output.pop();
    else if (!rooted && climb) output.push(segment);
  }
  return (rooted ? '/' : '') + output.join('/');
}
