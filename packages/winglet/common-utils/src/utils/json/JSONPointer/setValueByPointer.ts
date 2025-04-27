import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { compilePointer } from './utils/compileSegments';
import { JSONPointerError } from './utils/error';
import { setValue } from './utils/setValue';

export const setValueByPointer = <Input extends Dictionary>(
  input: Input,
  pointer: string | string[],
  value: any,
): Dictionary => {
  if (!(isPlainObject(input) || isArray(input)))
    throw new JSONPointerError(
      'INVALID_INPUT',
      '`input` must be a plain object or an array.',
      { input },
    );
  return setValue(input, compilePointer(pointer), value);
};
