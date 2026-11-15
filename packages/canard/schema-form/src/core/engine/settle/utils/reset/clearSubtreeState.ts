import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';

/**
 * Begin a load lifetime by clearing interaction flags in its own subtree.
 * @param node - Live root of the scope being loaded
 * @returns Nothing; sibling state remains untouched
 */
export const clearSubtreeState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const pending = [node];
  const visited = new Set<Self>();
  while (pending.length) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    current.interactionEpoch += 1;
    current.storedState = captureFieldNodeChange(current, 'storedState', {});
    for (const child of current.children ?? []) pending.push(child);
  }
};
