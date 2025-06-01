import { isArray, isString } from '@winglet/common-utils';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePointer } from '@/json/JSONPointer/utils/escape/unescapePointer';

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

const handleArrayPointer = (pointer: string[]) => {
  for (let index = 0; index < pointer.length; index++) {
    const part = pointer[index];
    if (typeof part !== 'string' && typeof part !== 'number')
      throw new JSONPointerError(
        'INVALID_POINTER_TYPE',
        'JSON pointer must be of type string or number array.',
        { pointer },
      );
  }
  return pointer;
};

const handleStringPointer = (pointer: string) => {
  if (pointer.length === 0) return [];
  const parts = pointer.split(JSONPointer.Child);
  if (parts[0] !== '' && parts[0] !== JSONPointer.Root)
    throw new JSONPointerError(
      'INVALID_POINTER_TYPE',
      `JSON pointer must start with ${JSONPointer.Root} or ${JSONPointer.Child}.`,
      { pointer },
    );
  const length = parts.length - 1;
  const segments = new Array<string>(length);
  for (let index = 0; index < length; index++) {
    const part = parts[index + 1];
    segments[index] = unescapePointer(part);
  }
  return segments;
};
