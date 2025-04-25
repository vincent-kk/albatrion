import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { getValue } from './utils/getValue';

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
