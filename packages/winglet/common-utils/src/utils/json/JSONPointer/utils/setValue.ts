import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { isArrayIndex } from '@/common-utils/utils/filter/isArrayIndex';

import { isForbiddenKey } from './isForbiddenKey';
import { unescapePointer } from './unescapePointer';

export const setValue = <Input extends Dictionary>(
  input: Input,
  segments: string[],
  value: any,
): Dictionary => {
  const length = segments.length;
  if (length === 0) return value;

  let current: any = input;
  let part = '';
  for (let index = 0; index < length; ) {
    part = unescapePointer(segments[index++]);
    if (isForbiddenKey(part)) return input;
    const isLastSegment = index === length;
    if (current[part] === undefined && !isLastSegment) {
      if (isArrayIndex(segments[index]) || segments[index] === '-')
        current[part] = [];
      else current[part] = {};
    }
    if (isArray(current) && part === '-') part = current.length.toString();
    if (isLastSegment) break;
    current = current[part];
  }

  if (value === undefined) delete current[part];
  else current[part] = value;

  return input;
};
