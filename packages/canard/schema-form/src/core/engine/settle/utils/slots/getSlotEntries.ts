import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotChildIndex } from './getSlotChildIndex';

/**
 * Enumerate only materialized candidates, preserving blueprint document order.
 * @param host - Source host whose owned children and slots have been visited
 * @param overlay - Input-only descendant bindings to include
 * @param template - Fixed parent blueprint, required when the patch has no instance
 * @returns Unique canonical entries, without expanding unvisited recursive templates
 */
export const getSlotEntries = <Self extends FieldNodeRecord<Self>>(
  host: Self | undefined,
  overlay?: InactiveSlotOverlay,
  template: BlueprintNode | undefined = host?.blueprintNode,
): readonly BlueprintChildEntry[] => {
  const entries = new Set<BlueprintChildEntry>();
  if (!overlay?.replace)
    for (const child of host?.children ?? []) {
      if (child.parent !== host || !host) continue;
      const entry = getRetainedChildEntry(
        host,
        child.name,
        child.blueprintNode,
      );
      if (entry) entries.add(entry);
    }
  if (!overlay?.replace) {
    for (const entry of host?.inactiveSlots?.keys() ?? []) entries.add(entry);
    for (const entry of host?.inactiveSlotOverlays?.keys() ?? [])
      entries.add(entry);
  }
  for (const entry of overlay?.children?.keys() ?? []) entries.add(entry);
  const ordered = [...entries];
  if (template)
    ordered.sort((left, right) => {
      if (template.kind === 'array') {
        const difference = Number(left.name) - Number(right.name);
        if (difference) return difference;
        const candidates = getItemEntries(template, Number(left.name));
        return candidates.indexOf(left) - candidates.indexOf(right);
      }
      return (
        getSlotChildIndex(template, left.name, left.node) -
        getSlotChildIndex(template, right.name, right.node)
      );
    });
  return ordered;
};
