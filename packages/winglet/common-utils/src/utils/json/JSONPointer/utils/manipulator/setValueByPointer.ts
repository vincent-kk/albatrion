import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { setValue } from './utils/setValue';

/**
 * Function to set a value at a specific location in an object using JSON Pointer
 * Supports JSON Pointer according to RFC 6901 specification
 *
 * @template Input - Input object type (Dictionary or Array)
 * @param input - Target object to set value in
 * @param pointer - JSON Pointer (string or string array)
 * @param value - Value to set
 * @returns Modified object
 * @throws {JSONPointerError} When input is invalid or pointer is invalid
 */
export const setValueByPointer = <Input extends Dictionary | Array<any>>(
  input: Input,
  pointer: string | string[],
  value: any,
  overwrite: boolean = true,
): Dictionary | Array<any> => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return setValue(input, compilePointer(pointer), value, overwrite);
};
