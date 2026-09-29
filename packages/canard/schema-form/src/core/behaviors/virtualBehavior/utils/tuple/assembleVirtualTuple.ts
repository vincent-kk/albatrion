import type { Behavior } from '../../../../record';
import { readVirtualValue } from './readVirtualValue';

/** Assemble referenced sibling values in the blueprint's field order. */
export const assembleVirtualTuple: Behavior['assemble'] = (node, children) => {
  const previous = node.local;
  if (Array.isArray(previous) && previous.length === children.length) {
    let unchanged = true;
    for (let index = 0; index < children.length; index++)
      if (previous[index] !== readVirtualValue(children[index])) {
        unchanged = false;
        break;
      }
    if (unchanged) return previous;
  }
  const values: unknown[] = [];
  for (const child of children) values.push(readVirtualValue(child));
  return values;
};
