import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { getLoadValue } from '../loadValues/getLoadValue';
import { setLoadValue } from '../loadValues/setLoadValue';
import { prepareSlotShadow } from '../verify/prepareSlotShadow';
import { writeFieldNode } from '../write/writeFieldNode';
import { clearSubtreeState } from './clearSubtreeState';

/**
 * Reload one node's retained source without resetting form health or siblings.
 * @param node - Live subtree root whose load lifetime restarts
 * @param option - This load's automatic-write selection
 * @returns Nothing; the node's source and subtree are committed once
 */
const resetFieldNodeSubtreeBody = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption,
): void => {
  if (node.detached && hasLivePathKind(node)) return;
  const value = getLoadValue(node.runtime.loadSnapshot, node.path);
  node.runtime.loadSnapshot = setLoadValue(
    node.runtime.loadSnapshot,
    node.path,
    value,
  );
  clearSubtreeState(node);
  writeFieldNode(node, value, 'load', option);
};

/** Replay resolved inputs only in verification mode, preserving the ordinary entry. */
export const resetFieldNodeSubtree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption,
): void => {
  if (node.runtime.slots !== 'verify')
    return resetFieldNodeSubtreeBody(node, option);
  const complete = prepareSlotShadow(node, (shadow) =>
    resetFieldNodeSubtree(shadow, option),
  );
  let failure: unknown;
  try {
    return resetFieldNodeSubtreeBody(node, option);
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    complete?.(failure);
  }
};
