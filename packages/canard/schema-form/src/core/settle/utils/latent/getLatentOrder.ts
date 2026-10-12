import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Locate a latent occurrence in the blueprint's child order at every depth.
 * @param parent - Actual occurrence parent, including recursive instances
 * @param name - Child name at the first edge
 * @param template - Child template at the first edge
 * @returns Root-to-leaf document positions for this occurrence
 */
export const getLatentOrder = <Self extends SchemaNodeRecord<Self>>(
  parent: Self | null, name: string, template: BlueprintNode,
): readonly number[] => {
  const order: number[] = [];
  let host = parent;
  let childName = name;
  let childTemplate = template;
  while (host) {
    const entries = host.blueprintNode.childEntries;
    const exact = entries.findIndex((entry) =>
      entry.name === childName && entry.node === childTemplate);
    const sameKind = exact < 0 ? entries.findIndex((entry) =>
      entry.name === childName && entry.node.kind === childTemplate.kind) : exact;
    const arrayIndex = Number(childName);
    order.unshift(sameKind >= 0 ? sameKind :
      Number.isInteger(arrayIndex) && arrayIndex >= 0 ? arrayIndex : 0);
    childName = host.name;
    childTemplate = host.blueprintNode;
    host = host.parent;
  }
  return order;
};
