import { visitFieldNodes } from '../../../navigation';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Replay automatic array shapes backwards without rewinding identity keys.
 * @param context - Failed settlement with ordered structural changes
 * @param within - Optional detached fill subtree whose own writes are withdrawn
 * @returns Nothing; each host again owns its earlier item occurrences
 */
export const restoreArrayStructure = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  within?: Self,
): void => {
  for (let index = context.arrayStructureLog.length - 1; index >= 0; index--) {
    const entry = context.arrayStructureLog[index];
    if (entry.restored) continue;
    const { host, previousItems, previousItemCount, previousExtras } = entry;
    if (within) {
      let ancestor: Self | null = host;
      while (ancestor && ancestor !== within) ancestor = ancestor.parent;
      if (!ancestor) continue;
    }
    const prior = new Set(previousItems);
    for (const item of host.children ?? [])
      if (!prior.has(item)) {
        getGateRegistry(item.runtime).remove(item);
        visitFieldNodes(
          item,
          (current) => {
            current.detached = true;
            current.active = captureFieldNodeChange(current, 'active', false);
            context.entered.delete(current);
            context.perished.delete(current);
          },
          { owned: true },
        );
      }
    const structure: Record<string, Self> = Object.create(null);
    for (const item of previousItems) {
      structure[item.name] = item;
      item.detached = false;
      item.active = captureFieldNodeChange(item, 'active', true);
      context.perished.delete(item);
    }
    host.structure = structure;
    host.children = captureFieldNodeChange(host, 'children', previousItems);
    host.itemCount = previousItemCount;
    host.undeclaredValues = previousExtras;
    context.dirtyPaths.add(host.path);
    context.shapeDirtyPaths.add(host.path);
    entry.restored = true;
  }
};
