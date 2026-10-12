import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { writeSchemaNode } from '../write/writeSchemaNode';
import { clearSubtreeState } from './clearSubtreeState';
import { getLoadValue } from './getLoadValue';
import { setLoadValue } from './setLoadValue';

/**
 * Reload one node's retained source without resetting form health or siblings.
 * @param node - Live subtree root whose load lifetime restarts
 * @param option - This load's automatic-write selection
 * @returns Nothing; the node's source and subtree are committed once
 */
export const resetSchemaNodeSubtree = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  option: SetValueOption,
): void => {
  if (node.detached && hasLivePathKind(node)) return;
  const value = getLoadValue(node.runtime.loadSnapshot, node.path);
  node.runtime.loadSnapshot = setLoadValue(
    node.runtime.loadSnapshot,
    node.path,
    value,
  );
  clearSubtreeState(node);
  writeSchemaNode(node, value, 'load', option);
};
