import { isArray, isArrayIndex } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import {
  deleteDataProperty,
  getDataProperty,
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
  for (let index = hasRootPrefix ? 1 : 0; index < length; ) {
    segment = segments[index++];
    // Resolved before the auto-creation below, which would otherwise create a literal
    // '-' property on the array and leave the cursor pointing at nothing
    if (isArray(cursor) && segment === ADD_ITEM_ALIAS)
      segment = '' + cursor.length;
    const isLastSegment = index === length;
    if (isLastSegment === false) {
      const current = getDataProperty(cursor, segment);
      if (preserveNull && current === null) return value;
      if (current == null) {
        if (isArrayIndex(segments[index]) || segments[index] === ADD_ITEM_ALIAS)
          setDataProperty(cursor, segment, []);
        else setDataProperty(cursor, segment, {});
      }
    }
    if (isLastSegment) break;
    cursor = getDataProperty(cursor, segment);
  }

  if (input === undefined) deleteDataProperty(cursor, segment);
  else {
    if (hasOwnProperty(cursor, segment)) {
      if (overwrite) setDataProperty(cursor, segment, input);
    } else setDataProperty(cursor, segment, input);
  }

  return value;
};
