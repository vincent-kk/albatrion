import { isArray, isArrayIndex } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

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
  for (let i = hasRootPrefix ? 1 : 0; i < length; ) {
    segment = segments[i++];
    if (isForbiddenKey(segment)) return input;
    const isLastSegment = i === length;
    if (cursor[segment] === undefined && !isLastSegment) {
      if (isArrayIndex(segments[i]) || segments[i] === ADD_ITEM_ALIAS)
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
    if (hasOwnProperty(cursor, segment)) {
      if (overwrite) cursor[segment] = value;
    } else cursor[segment] = value;
  }

  return input;
};
