import type { Dictionary } from '@aileron/declare';

import { visitFieldNodes } from '../../../navigation';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Replay automatic array shapes backwards without rewinding identity keys.
 * @param context - Failed settlement with ordered structural changes
 * @param onlyHost - Optional detached array whose final decision selects the boundary structure
 * @returns Nothing; each host again owns its earlier item occurrences
 */
export const restoreArrayStructure = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  onlyHost?: Self,
): void => {
  for (let index = context.arrayStructureLog.length - 1; index >= 0; index--) {
    const entry = context.arrayStructureLog[index];
    if (entry.isRestored) continue;
    const { host, previousItems, previousItemCount, previousExtras } = entry;
    if (onlyHost && host !== onlyHost) continue;
    const prior = new Set(previousItems);
    for (const item of host.children ?? [])
      if (!prior.has(item)) {
        getGateRegistry(item.runtime).remove(item);
        visitFieldNodes(
          item,
          (current) => {
            current.isDetached = true;
            current.isActive = captureFieldNodeChange(
              current,
              'isActive',
              false,
            );
            context.enteredNodes.delete(current);
            context.perishedNodes.delete(current);
          },
          { isOwned: true },
        );
      }
    const childrenByName: Dictionary<Self> = Object.create(null);
    for (const item of previousItems) {
      childrenByName[item.name] = item;
      item.isDetached = false;
      item.isActive = captureFieldNodeChange(item, 'isActive', true);
      context.perishedNodes.delete(item);
    }
    host.childrenByName = childrenByName;
    host.children = captureFieldNodeChange(host, 'children', previousItems);
    host.itemCount = previousItemCount;
    host.extras = previousExtras;
    context.dirtyPaths.add(host.path);
    context.shapeDirtyPaths.add(host.path);
    entry.isRestored = true;
  }
};
