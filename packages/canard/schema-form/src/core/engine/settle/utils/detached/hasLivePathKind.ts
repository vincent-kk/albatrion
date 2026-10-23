import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Check whether a detached reference's path and fold-inclusive kind are live again.
 * @param node - Detached reference rooted in the current tree runtime
 * @returns True when the current shape owns its exact path and kind
 */
export const hasLivePathKind = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const indexed = getGateRegistry(node.runtime).hasRegisteredPathKind(
    node.path,
    getBlueprintNodeIdentity(node.blueprintNode),
  );
  if (indexed !== undefined) return indexed;
  const current = find(node.rootNode, node.path);
  return (
    current !== null &&
    !current.detached &&
    current.blueprintNode === node.blueprintNode
  );
};
