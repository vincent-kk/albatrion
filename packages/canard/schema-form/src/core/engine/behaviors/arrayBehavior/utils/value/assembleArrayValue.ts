import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../../record';
import { getArrayItemTemplate } from './getArrayItemTemplate';
import { holeValue } from './holeValue';

/**
 * Assemble stored array slots without changing node state.
 * @param node - Shape, selected child emissions, and undeclared tail
 * @param previous - Prior assembled array for hole and reference reuse
 * @returns Stored array or explicit null source
 */
export const assembleArrayValue = (
  node: Pick<
    FieldNodeRecord<unknown>,
    'blueprintNode' | 'childrenByName' | 'extras' | 'itemCount' | 'source'
  >,
  previous?: readonly unknown[],
): unknown => {
  if (node.source === null) return null;
  const extras = isArray(node.extras) ? node.extras : [];
  const result: unknown[] = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const template = getArrayItemTemplate(node, index);
    if (!template) {
      result.push(extras[index - tailStart]);
      continue;
    }
    tailStart++;
    const child = node.childrenByName?.['' + index];
    const outputValue =
      child !== null &&
      typeof child === 'object' &&
      'storedOutputValue' in child
        ? child.storedOutputValue
        : undefined;
    result.push(
      outputValue === undefined
        ? holeValue(template.kind, previous?.[index])
        : outputValue,
    );
  }
  if (previous?.length === result.length) {
    let unchanged = true;
    for (let index = 0; index < result.length; index++)
      if (!Object.is(result[index], previous[index])) {
        unchanged = false;
        break;
      }
    if (unchanged) return previous;
  }
  return result;
};
