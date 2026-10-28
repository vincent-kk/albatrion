import type { PointerSegment } from '../constants/PointerOperator';
import { parseSegment } from './parseSegment';

const EMPTY_SEGMENTS: readonly PointerSegment[] = Object.freeze([]);

/** Decode one split array directly; ordinary relative arrays retain their identity. */
export const parsePointerSegments = (
  pointer: string | readonly string[],
): readonly PointerSegment[] => {
  if (pointer === '' || pointer === '#') return EMPTY_SEGMENTS;
  if (typeof pointer !== 'string') {
    const offset = pointer[0] === '#' ? 1 : 0;
    let segments: PointerSegment[] | undefined = offset
      ? pointer.slice(offset)
      : undefined;
    for (let index = offset; index < pointer.length; index++) {
      const segment = parseSegment(pointer[index]);
      if (!segments && segment !== pointer[index])
        segments = pointer.slice(offset);
      if (segments) segments[index - offset] = segment;
    }
    return segments ?? pointer;
  }
  const offset = pointer.startsWith('#/') ? 2 : pointer[0] === '/' ? 1 : 0;
  const names = (offset ? pointer.slice(offset) : pointer).split('/');
  const segments: PointerSegment[] = names;
  for (let index = 0; index < names.length; index++)
    segments[index] = parseSegment(names[index]);
  return segments;
};
