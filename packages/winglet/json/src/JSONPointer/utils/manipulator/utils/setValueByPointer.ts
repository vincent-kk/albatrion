import { isArray, isArrayIndex } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import {
  deleteDataProperty,
  getDataProperty,
  isReservedName,
  setDataProperty,
} from '@winglet/common-utils/object';

import type { Dictionary } from '@aileron/declare';

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
  let reserved = false;
  for (let index = hasRootPrefix ? 1 : 0; index < length; ) {
    segment = segments[index++];
    // Resolved before the auto-creation below, which would otherwise create a literal
    // '-' property on the array and leave the cursor pointing at nothing
    if (isArray(cursor) && segment === ADD_ITEM_ALIAS)
      segment = '' + cursor.length;
    // Reserved names take the own-data path; ordinary keys keep plain access
    reserved = isReservedName(segment);
    const isLastSegment = index === length;
    if (isLastSegment === false) {
      const current = reserved
        ? getDataProperty(cursor, segment)
        : cursor[segment];
      if (preserveNull && current === null) return value;
      if (current == null) {
        const container =
          isArrayIndex(segments[index]) || segments[index] === ADD_ITEM_ALIAS
            ? []
            : {};
        if (reserved) setDataProperty(cursor, segment, container);
        else cursor[segment] = container;
      }
    }
    if (isLastSegment) break;
    cursor = reserved ? getDataProperty(cursor, segment) : cursor[segment];
  }

  if (input === undefined) deleteDataProperty(cursor, segment);
  else if (hasOwnProperty(cursor, segment)) {
    if (overwrite) {
      if (reserved) setDataProperty(cursor, segment, input);
      else cursor[segment] = input;
    }
  } else if (reserved) setDataProperty(cursor, segment, input);
  else cursor[segment] = input;

  return value;
};
