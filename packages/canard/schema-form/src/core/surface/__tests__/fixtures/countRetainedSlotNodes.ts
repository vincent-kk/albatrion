import { FieldNode } from '../../runtime/FieldNode';

/**
 * Count instances reachable through current shape, retained slots, and parent links.
 * @param root - Runtime root whose slot graph must not retain earlier host lifetimes
 * @returns Unique node count, including stale hosts reached through a slot's parent
 */
export const countRetainedSlotNodes = (root: FieldNode): number => {
  const seen = new Set<FieldNode>();
  const pending = [root];
  while (pending.length) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    if (current.parent) pending.push(current.parent);
    if (current.children) pending.push(...current.children);
    const slots: unknown = Reflect.get(current, 'inactiveSlots');
    if (slots instanceof Map)
      for (const slot of slots.values())
        if (slot instanceof FieldNode) pending.push(slot);
    const descendants: unknown = Reflect.get(current, 'inactiveSlotChildren');
    if (descendants instanceof Map)
      for (const child of descendants.values())
        if (child instanceof FieldNode) pending.push(child);
  }
  return seen.size;
};
