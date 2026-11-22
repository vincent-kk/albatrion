import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { FieldNodeWriteKind } from '../../../types/value';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { getLoadValue } from '../loadValues/getLoadValue';
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
  if (node.isDetached) return;
  const targets = resolveStorageTargets(node);
  const snapshot = node.runtime.loadSnapshot;
  const value = targets
    ? targets.map((target) => getLoadValue(snapshot, target.path))
    : getLoadValue(snapshot, node.path);
  clearSubtreeState(node);
  writeFieldNode(node, value, FieldNodeWriteKind.Load, option);
};
