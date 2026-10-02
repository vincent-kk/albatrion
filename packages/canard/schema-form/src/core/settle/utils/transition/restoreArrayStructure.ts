import { captureSchemaNodeChange } from '../../../record';
import { walkOwnedSchemaNodes } from '../walkOwnedSchemaNodes';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Replay automatic array shapes backwards without rewinding identity keys.
 * @param context - Failed settlement with ordered structural changes
 * @param within - Optional detached fill subtree whose own writes are withdrawn
 * @returns Nothing; each host again owns its earlier item occurrences
 */
export const restoreArrayStructure = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, within?: Self,
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
    for (const item of host.children ?? []) if (!prior.has(item)) {
      getGateRegistry(item.runtime).remove(item);
      walkOwnedSchemaNodes(item, (current) => {
        current.detached = true;
        current.active = captureSchemaNodeChange(current, 'active', false);
        context.entered.delete(current);
        context.perished.delete(current);
      });
    }
    const structure: Record<string, Self> = Object.create(null);
    for (const item of previousItems) {
      structure[item.name] = item;
      item.detached = false;
      item.active = captureSchemaNodeChange(item, 'active', true);
      context.perished.delete(item);
    }
    host.structure = structure;
    host.children = captureSchemaNodeChange(host, 'children', previousItems);
    host.itemCount = previousItemCount;
    host.extras = previousExtras;
    context.dirtyPaths.add(host.path);
    context.shapeDirtyPaths.add(host.path);
    entry.restored = true;
  }
};
