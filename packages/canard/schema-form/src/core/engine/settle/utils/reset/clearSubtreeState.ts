import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { clearFieldNodeMemos } from './clearFieldNodeMemos';

/**
 * Begin a load lifetime by clearing interaction flags in its own subtree.
 * @param node - Live root of the scope being loaded
 * @param clearMemos - Also drop each visited node's recomputable memo fields; a form reset passes true, a subtree reset keeps them
 * @returns Nothing; sibling state remains untouched
 */
export const clearSubtreeState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  clearMemos = false,
): void => {
  const pending = [node];
  const visited = new Set<Self>();
  while (pending.length) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (clearMemos) clearFieldNodeMemos(current);
    current.__interactionEpoch__ += 1;
    current.__state__ = captureFieldNodeChange(current, '__state__', {});
    for (const child of current.children ?? []) pending.push(child);
  }
};
