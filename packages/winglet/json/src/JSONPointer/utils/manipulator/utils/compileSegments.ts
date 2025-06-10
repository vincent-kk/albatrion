import { isArray, isString } from '@winglet/common-utils/filter';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';

import { JSONPointerError } from './error';

export const compilePointer = (pointer: string | string[]) => {
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

const handleArrayPointer = (segments: string[]) => {
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (typeof segment !== 'string' && typeof segment !== 'number')
      throw new JSONPointerError(
        'INVALID_POINTER_TYPE',
        'JSON pointer must be of type string or number array.',
        { pointer: segments },
      );
    else segments[index] = unescapePath(segment);
  }
  return segments;
};
