import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { getValue } from './utils/getValue';

/**
 * Function to extract values from an object using JSON Pointer
 * Supports JSON Pointer according to RFC 6901 specification
 *
 * @template Input - Input object type
 * @param input - Target object to extract value from
 * @param pointer - JSON Pointer (string or string array)
 * @returns Value pointed to by the pointer
 * @throws {JSONPointerError} When input is invalid or pointer cannot be found
 */
export const getValueByPointer = <Input extends Dictionary>(
  input: Input,
  pointer: string | string[],
): any => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return getValue(input, compilePointer(pointer));
};
