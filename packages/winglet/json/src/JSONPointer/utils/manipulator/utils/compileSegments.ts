import { isArray, isString } from '@winglet/common-utils/filter';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';

import { JSONPointerError } from './error';

export const compilePointer = (pointer: string | (string | number)[]) => {
  if (isString(pointer)) return handleStringPointer(pointer);
  if (isArray(pointer)) return handleArrayPointer(pointer);
  throw new JSONPointerError(
    'INVALID_POINTER_TYPE',
    'JSON pointer must be of type string or array.',
    { pointer },
  );
};

const handleStringPointer = (pointer: string) => {
  if (pointer.length === 0) return [];
  const parts = pointer.split(JSONPointer.Separator);
  if (parts[0] !== '' && parts[0] !== JSONPointer.Fragment)
    throw new JSONPointerError(
      'INVALID_POINTER_TYPE',
      `JSON pointer must start with ${JSONPointer.Fragment} or ${JSONPointer.Separator}.`,
      { pointer },
    );
  return handleArrayPointer(parts);
};

const handleArrayPointer = (segments: (string | number)[]) => {
  const length = segments.length;
  // Written into a fresh array: the caller owns the one it passed in, and unescaping it
  // in place would also corrupt a second use of the same array
  const compiled = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    const segment = segments[i];
    if (typeof segment === 'number') compiled[i] = '' + segment;
    else if (typeof segment === 'string') compiled[i] = unescapePath(segment);
    else
      throw new JSONPointerError(
        'INVALID_POINTER_TYPE',
        'JSON pointer must be of type string or number array.',
        { pointer: segments },
      );
  }
  return compiled;
};
