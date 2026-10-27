import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getLatentChildOrder } from './getLatentChildOrder';

/**
 * Locate a latent occurrence in the blueprint's child order at every depth.
 * @param parent - Actual occurrence parent, including recursive instances
 * @param name - Child name at the first edge
 * @param template - Child template at the first edge
 * @returns Root-to-leaf document positions for this occurrence
 */
export const getLatentOrder = <Self extends FieldNodeRecord<Self>>(
  parent: Self | null,
  name: string,
  template: BlueprintNode,
): readonly number[] => {
  const order: number[] = [];
  let host = parent;
  let childName = name;
  let childTemplate = template;
  while (host) {
    order.push(
      getLatentChildOrder(host.blueprintNode, childName, childTemplate),
    );
    childName = host.name;
    childTemplate = host.blueprintNode;
    host = host.parent;
  }
  return order.reverse();
};
