import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { getRetainedChildEntry } from './getRetainedChildEntry';

/**
 * Keep candidate-owned inactive descendants below a cleared array's empty shape.
 * @param node - Fresh cleared array clone whose own item count is zero
 * @param context - New-lifetime registration and recalculation work
 * @returns Nothing; private carrier clones stay absent from public children
 */
export const retainClearedArrayCarriers = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  for (const child of node.children ?? []) {
    if (child.parent !== node) continue;
    const entry = getRetainedChildEntry(node, child.name, child.blueprintNode);
    if (!entry) continue;
    (node.inactiveSlots ??= new Map()).set(entry, child);
    getGateRegistry(node.runtime).remove(child);
    visitFieldNodes(
      child,
      (carrier) => {
        carrier.detached = true;
        carrier.active = false;
        context.entered.delete(carrier);
        context.stateDirtyNodes.delete(carrier);
        context.dirtyPaths.delete(carrier.path);
        context.shapeDirtyPaths.delete(carrier.path);
      },
      { owned: true },
    );
  }
  node.structure = Object.create(null);
  node.children = [];
  node.inactiveSlotChildren?.clear();
};
