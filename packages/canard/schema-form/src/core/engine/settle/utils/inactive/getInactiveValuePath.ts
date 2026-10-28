import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Bind an exit result to any compacted keep-item positions without reviving nodes.
 * @param node - Original departing reference, whose path remains frozen
 * @param context - Optional clearing-array source rebinding plans
 * @returns Current retained address, or undefined when its item did not survive
 */
export const getInactiveValuePath = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): string | undefined => {
  if (!context.compactedSlotSources?.size) return node.path;
  const lineage: Self[] = [];
  for (
    let current: Self | null = node;
    current?.parent;
    current = current.parent
  )
    lineage.push(current);
  let path = '';
  for (let index = lineage.length - 1; index >= 0; index--) {
    const child = lineage[index];
    const compaction =
      child.parent && context.compactedSlotSources.get(child.parent);
    let name = child.name;
    if (compaction) {
      const binding = [...compaction.sources].find(
        ([, source]) => source === child,
      )?.[0];
      if (!binding) return undefined;
      name = binding.name;
    }
    path = appendSegment(path, name);
  }
  return path;
};
