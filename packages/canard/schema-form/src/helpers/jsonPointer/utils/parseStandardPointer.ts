import { BaseError } from '@winglet/common-utils/error';
import { unescapeSegment } from '@winglet/json/pointer-escape';

/** Preserve the existing local-reference failure code at the parser boundary. */
class PointerSyntaxError extends BaseError {
  constructor(pointer: string) {
    super(
      'JSON_POINTER',
      'INVALID_POINTER_TYPE',
      'JSON pointer must start with #/ or /.',
      { pointer },
    );
  }
}

/** RFC 6901 producers supply names, including tokens used as form operators. */
export const parseStandardPointer = (pointer: string): readonly string[] => {
  if (pointer === '' || pointer === '#') return [];
  const fragment = pointer[0] === '#';
  if (fragment ? pointer[1] !== '/' : pointer[0] !== '/')
    throw new PointerSyntaxError(pointer);
  const segments = pointer.slice(fragment ? 2 : 1).split('/');
  for (let index = 0; index < segments.length; index++) {
    let name = segments[index];
    if (fragment && name.includes('%')) name = decodeURIComponent(name);
    segments[index] = name.includes('~') ? unescapeSegment(name) : name;
  }
  return segments;
};
