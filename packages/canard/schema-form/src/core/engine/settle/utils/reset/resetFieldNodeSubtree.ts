import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { getLoadValue } from '../loadValues/getLoadValue';
import { setLoadValue } from '../loadValues/setLoadValue';
import { writeFieldNode } from '../write/writeFieldNode';
import { clearSubtreeState } from './clearSubtreeState';

/**
 * Reload one node's retained source without resetting form health or siblings.
 * @param node - Live subtree root whose load lifetime restarts
 * @param option - This load's automatic-write selection
 * @returns Nothing; the node's source and subtree are committed once
 */
export const resetFieldNodeSubtree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption,
): void => {
  if (node.detached) return;
  const value = getLoadValue(node.runtime.loadSnapshot, node.path);
  node.runtime.loadSnapshot = setLoadValue(
    node.runtime.loadSnapshot,
    node.path,
    value,
  );
  clearSubtreeState(node);
  writeFieldNode(node, value, 'load', option);
};
