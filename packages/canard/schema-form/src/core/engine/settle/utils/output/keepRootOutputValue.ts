import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';

/**
 * Keep a root object or array from omitting itself under omitEmpty (settle-root-output-value).
 * @param node - Node whose row projected stored value into output value
 * @param value - Assembled value the projection read
 * @param outputValue - Projected value of `value`
 * @returns `outputValue` unless a root object or array projected to absence; then `value` when it is already empty, or a new empty array when omitTrailingEmpty trimmed every item
 */
export const keepRootOutputValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  outputValue: unknown,
): unknown => {
  if (
    node.parent !== null ||
    outputValue !== undefined ||
    (node.behavior.type !== 'object' && node.behavior.type !== 'array')
  )
    return outputValue;
  return isArray(value) && value.length > 0 ? [] : value;
};
