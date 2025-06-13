import { isArray, isArrayIndex } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { isForbiddenKey } from './isForbiddenKey';

const ADD_ITEM_ALIAS = '-';

export const setValueByPointer = <Input extends Dictionary | Array<any>>(
  input: Input,
  segments: string[],
  value: any,
  overwrite: boolean,
): Dictionary => {
  const length = segments.length;
  const hasRootPrefix = segments[0] === '' || segments[0] === '#';
  if (length === 0 || (length === 1 && hasRootPrefix)) return value;

  let cursor: any = input;
  let segment = '';
  for (let index = hasRootPrefix ? 1 : 0; index < length; ) {
    segment = segments[index++];
    if (isForbiddenKey(segment)) return input;
    const isLastSegment = index === length;
    if (cursor[segment] === undefined && !isLastSegment) {
      if (isArrayIndex(segments[index]) || segments[index] === ADD_ITEM_ALIAS)
        cursor[segment] = [];
      else cursor[segment] = {};
    }
    if (isArray(cursor) && segment === ADD_ITEM_ALIAS)
      segment = cursor.length.toString();
    if (isLastSegment) break;
    cursor = cursor[segment];
  }

  if (value === undefined) delete cursor[segment];
  else {
    if (segment in cursor) {
      if (overwrite) cursor[segment] = value;
    } else cursor[segment] = value;
  }

  return input;
};
