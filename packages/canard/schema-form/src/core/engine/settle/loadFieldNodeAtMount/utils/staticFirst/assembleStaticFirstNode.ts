import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { FieldNodeRecord } from '../../../../record';
import { keepRootOutputValue } from '../../../utils/output/keepRootOutputValue';

/**
 * Assemble and project once, with separate fixed-kind behavior call sites.
 * @param node - First-load occurrence whose children have completed
 * @returns Nothing; eager stored and output values are ready before delivery
 */
export const assembleStaticFirstNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const children = node.children ?? EMPTY_ARRAY;
  let value: unknown;
  let outputValue: unknown;
  switch (node.behavior.type) {
    case 'object':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
      break;
    case 'array':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
      break;
    case 'string':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
      break;
    case 'number':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
      break;
    case 'boolean':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
      break;
    case 'null':
      value = node.behavior.assemble(node, children);
      outputValue = node.behavior.project(node, value);
  }
  node.storedValue = value;
  node.storedOutputValue = keepRootOutputValue(node, value, outputValue);
};
