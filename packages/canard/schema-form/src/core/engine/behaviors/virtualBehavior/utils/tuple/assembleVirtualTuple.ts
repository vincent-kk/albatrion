import { isArray } from '@winglet/common-utils/filter';

import type { Behavior } from '../../../../record';
import { readVirtualValue } from './readVirtualValue';

/** Assemble referenced sibling values in the blueprint's field order. */
export const assembleVirtualTuple: Behavior['assemble'] = (node) => {
  const fields = node.blueprintNode.fields ?? [];
  const children = node.childrenByName;
  const previous = node.storedValue;
  if (isArray(previous) && previous.length === fields.length) {
    let unchanged = true;
    for (let index = 0; index < fields.length; index++)
      if (previous[index] !== readVirtualValue(children?.[fields[index]])) {
        unchanged = false;
        break;
      }
    if (unchanged) return previous;
  }
  const values: unknown[] = [];
  for (const field of fields) values.push(readVirtualValue(children?.[field]));
  return values;
};
