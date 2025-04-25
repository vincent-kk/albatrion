import { isArray, isArrayIndex } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import { isForbiddenKey } from './isForbiddenKey';
import { unescape } from './unescape';

export const setValue = (
  input: Dictionary,
  segments: string[],
  value: unknown,
): unknown => {
  const length = segments.length;
  if (length === 0) return input;

  let current: any = input;
  let part = '';
  for (let index = 0; index < length; ) {
    part = unescape(segments[index++]);
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
