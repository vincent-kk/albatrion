import type { PointerSegment } from '../constants/PointerOperator';
import { parseSegment } from './parseSegment';

/** Read one encoded segment without constructing a split array; negative positions count from the end. */
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

/** Decode only the requested segment, retaining operator identity. */
export const readPointerSegment = (
  path: string,
  index: number,
): PointerSegment | undefined => {
  const segment = readFormattedPointerSegment(path, index);
  return segment === undefined ? undefined : parseSegment(segment);
};

/** Reuse a canonical encoded name token without a decode/format round trip. */
export const readFormattedNameSegment = (
  path: string,
  index: number,
): string | undefined => {
  const segment = readFormattedPointerSegment(path, index);
  switch (segment) {
    case '*':
    case '..':
    case '.':
    case '@':
      return undefined;
    default:
      return segment;
  }
};
