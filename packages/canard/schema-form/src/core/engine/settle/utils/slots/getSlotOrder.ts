import type { Nullable } from '@aileron/declare';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getSlotChildIndex } from './getSlotChildIndex';

/**
 * Locate a latent occurrence in the blueprint's child order at every depth.
 * @param parent - Actual occurrence parent, including recursive instances
 * @param name - Child name at the first edge
 * @param template - Child template at the first edge
 * @returns Root-to-leaf document positions for this occurrence
 */
export const getSlotOrder = <Self extends FieldNodeRecord<Self>>(
  parent: Nullable<Self>,
  name: string,
  template: BlueprintNode,
): readonly number[] => {
  const order: number[] = [];
  let host = parent;
  let childName = name;
  let childTemplate = template;
  while (host) {
    const index = getSlotChildIndex(
      host.blueprintNode,
      childName,
      childTemplate,
    );
    const arrayIndex = Number(childName);
    order.push(
      index >= 0
        ? index
        : Number.isInteger(arrayIndex) && arrayIndex >= 0
          ? arrayIndex
          : 0,
    );
    childName = host.name;
    childTemplate = host.blueprintNode;
    host = host.parent;
  }
  return order.reverse();
};
