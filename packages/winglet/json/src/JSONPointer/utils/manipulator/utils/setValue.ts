import { isArray, isArrayIndex } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import { unescapePointer } from '@/json/JSONPointer/utils/escape/unescapePointer';

import { isForbiddenKey } from './isForbiddenKey';

const ADD_ITEM_ALIAS = '-';

export const setValue = <Input extends Dictionary | Array<any>>(
  input: Input,
  segments: string[],
  value: any,
  overwrite: boolean,
): Dictionary => {
  const length = segments.length;
  if (length === 0) return value;

  let cursor: any = input;
  let part = '';
  for (let index = 0; index < length; ) {
    part = unescapePointer(segments[index++]);
    if (isForbiddenKey(part)) return input;
    const isLastSegment = index === length;
    if (cursor[part] === undefined && !isLastSegment) {
      if (isArrayIndex(segments[index]) || segments[index] === ADD_ITEM_ALIAS)
        cursor[part] = [];
      else cursor[part] = {};
    }
    if (isArray(cursor) && part === ADD_ITEM_ALIAS)
      part = cursor.length.toString();
    if (isLastSegment) break;
    cursor = cursor[part];
  }

  if (value === undefined) delete cursor[part];
  else {
    if (part in cursor) {
      if (overwrite) cursor[part] = value;
    } else cursor[part] = value;
  }

  return input;
};
