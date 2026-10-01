import { isArray } from '@winglet/common-utils/filter';
import { getItemEntry } from '../../../../blueprint';
import type { Behavior } from '../../../../record';
import { holeValue } from './holeValue';

/**
 * Combine emitted items and undeclared tail positions without changing source.
 * @param node - Array host with committed child projections and tail extras
 * @returns Local array, reusing its prior reference when elements are identical
 */
export const assembleArray: Behavior['assemble'] = (node) => {
  const previous = isArray(node.local) ? node.local : undefined;
  const extras = isArray(node.extras) ? node.extras : [];
  const result: unknown[] = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) {
      result.push(extras[index - tailStart]);
      continue;
    }
    tailStart++;
    const child = node.structure?.[String(index)];
    const emission = child !== null && typeof child === 'object' &&
      'emit' in child ? child.emit : undefined;
    result.push(emission === undefined
      ? holeValue(entry.node.kind, previous?.[index]) : emission);
  }
  if (previous?.length === result.length &&
    result.every((value, index) => Object.is(value, previous[index]))) return previous;
  return result;
};
