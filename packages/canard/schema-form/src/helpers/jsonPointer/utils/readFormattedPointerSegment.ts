/**
 * Read one encoded segment without constructing a split array.
 * @param path - Canonical address, with an optional `/` or `#/` prefix.
 * @param index - Zero-based position from the start, or a negative position counted from the end (-1 is the last segment).
 * @returns The segment text exactly as written in the address, or undefined for the root or a position outside the address.
 */
export const readFormattedPointerSegment = (
  path: string,
  index: number,
): string | undefined => {
  if (path === '' || path === '#') return undefined;
  const offset = path.startsWith('#/') ? 2 : path[0] === '/' ? 1 : 0;
  let start = offset;
  let end = path.length;
  if (index < 0) {
    for (let position = -1; position > index; position--) {
      end = path.lastIndexOf('/', end - 1);
      if (end < offset) return undefined;
    }
    start = Math.max(offset, path.lastIndexOf('/', end - 1) + 1);
  } else {
    for (let position = 0; position < index; position++) {
      start = path.indexOf('/', start);
      if (start < 0) return undefined;
      start++;
    }
    const next = path.indexOf('/', start);
    if (next >= 0) end = next;
  }
  return path.slice(start, end);
};
