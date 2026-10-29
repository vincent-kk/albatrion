import { BaseError } from '@winglet/common-utils/error';
import { unescapeSegment } from '@winglet/json/pointer-escape';

import { JSONPointer as $ } from '../constants/JSONPointer';

/** Raised when a non-root pointer string lacks a `/` or `#/` prefix; carries the code INVALID_POINTER_TYPE. */
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

/**
 * Split an RFC 6901 pointer produced outside the form, such as a validator path or a schema reference, into plain names.
 * @param pointer - The empty string or `#` for the root, otherwise a string starting with `/` or `#/`. Segments of a `#/` fragment are percent-decoded before `~` decoding; segments of a plain string are not.
 * @returns Decoded names only; `*`, `..`, `.` and `@` stay ordinary names.
 * @throws PointerSyntaxError (code INVALID_POINTER_TYPE) when a non-root string starts with neither `/` nor `#/`; URIError when a fragment segment holds a malformed percent escape.
 */
export const parseStandardPointer = (pointer: string): readonly string[] => {
  if (pointer === $.Root || pointer === $.Fragment) return [];
  const fragment = pointer[0] === $.Fragment;
  if (fragment ? pointer[1] !== $.Separator : pointer[0] !== $.Separator)
    throw new PointerSyntaxError(pointer);
  const segments = pointer.slice(fragment ? 2 : 1).split($.Separator);
  for (let index = 0; index < segments.length; index++) {
    let name = segments[index];
    if (fragment && name.includes('%')) name = decodeURIComponent(name);
    segments[index] = name.includes('~') ? unescapeSegment(name) : name;
  }
  return segments;
};
