import type { SchemaNodeRecord } from '../../../record';
import { find } from '../../../navigation';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Check whether a detached reference's path and kind are live again.
 * @param node - Detached reference rooted in the current tree runtime
 * @returns True when the current shape owns its exact path and kind
 */
export const hasLivePathKind = <Self extends SchemaNodeRecord<Self>>(node: Self): boolean => {
  const indexed = getGateRegistry(node.runtime).hasRegisteredPathKind(
    node.path, node.blueprintNode.kind);
  if (indexed !== undefined) return indexed;
  const current = find(node.rootNode, node.path);
  return current !== null && !current.detached &&
    current.blueprintNode.kind === node.blueprintNode.kind;
};
