import type { PointerSegment } from '../constants/PointerOperator';
import { parseSegment } from './parseSegment';

export interface ParsedPointer {
  readonly absolute: boolean;
  readonly segments: readonly PointerSegment[];
}

const RELATIVE_EMPTY: ParsedPointer = Object.freeze({
  absolute: false,
  segments: Object.freeze([]),
});
const ABSOLUTE_EMPTY: ParsedPointer = Object.freeze({
  absolute: true,
  segments: Object.freeze([]),
});

/** Split once, then replace tokens in that array without allocating a mapped array. */
export const parsePointer = (
  pointer: string | readonly string[],
): ParsedPointer => {
  if (pointer === '') return RELATIVE_EMPTY;
  if (pointer === '#') return ABSOLUTE_EMPTY;
  if (typeof pointer !== 'string') {
    const absolute = pointer[0] === '#';
    const offset = absolute ? 1 : 0;
    let segments: PointerSegment[] | undefined = absolute
      ? pointer.slice(1)
      : undefined;
    for (let index = offset; index < pointer.length; index++) {
      const segment = parseSegment(pointer[index]);
      if (!segments && segment !== pointer[index])
        segments = pointer.slice(offset);
      if (segments) segments[index - offset] = segment;
    }
    return { absolute, segments: segments ?? pointer };
  }
  const offset = pointer.startsWith('#/') ? 2 : pointer[0] === '/' ? 1 : 0;
  const absolute = offset > 0;
  const segments = (offset ? pointer.slice(offset) : pointer).split('/');
  const parsed: PointerSegment[] = segments;
  for (let index = 0; index < segments.length; index++)
    parsed[index] = parseSegment(segments[index]);
  return { absolute, segments: parsed };
};
