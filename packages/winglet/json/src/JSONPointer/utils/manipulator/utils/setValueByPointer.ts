import { isArray, isArrayIndex } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary } from '@aileron/declare';

import { isForbiddenKey } from './isForbiddenKey';

const ADD_ITEM_ALIAS = '-';

export const setValueByPointer = <Input extends Dictionary | Array<any>>(
  value: Input,
  segments: string[],
  input: any,
  overwrite: boolean,
  preserveNull: boolean,
): Dictionary => {
  const length = segments.length;
  const hasRootPrefix = segments[0] === '' || segments[0] === '#';
  if (length === 0 || (length === 1 && hasRootPrefix)) return input;

  let cursor: any = value;
  let segment = '';
  for (let index = hasRootPrefix ? 1 : 0; index < length; ) {
    segment = segments[index++];
    if (isForbiddenKey(segment)) return value;
    const isLastSegment = index === length;
    if (isLastSegment === false) {
      const current = cursor[segment];
      if (preserveNull && current === null) return value;
      if (current == null) {
        if (isArrayIndex(segments[index]) || segments[index] === ADD_ITEM_ALIAS)
          cursor[segment] = [];
        else cursor[segment] = {};
      }
    }
    if (isArray(cursor) && segment === ADD_ITEM_ALIAS)
      segment = cursor.length.toString();
    if (isLastSegment) break;
    cursor = cursor[segment];
  }

  if (input === undefined) delete cursor[segment];
  else {
    if (hasOwnProperty(cursor, segment)) {
      if (overwrite) cursor[segment] = input;
    } else cursor[segment] = input;
  }

  return value;
};
