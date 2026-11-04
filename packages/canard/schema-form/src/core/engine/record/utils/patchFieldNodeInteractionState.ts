import type { NodeStateFlags } from '../../types/state';
import type { FieldNodeRecord } from '../types/record';
import { recordFieldNodeRevealBaseline } from './recordFieldNodeRevealBaseline';
import { shallowPatch } from './shallowPatch';

/** Patch live interaction flags while retaining their reference for a no-op. */
export const patchFieldNodeInteractionState = <Self>(
  node: FieldNodeRecord<Self>,
  patch: Partial<NodeStateFlags>,
): void => {
  if (node.detached) return;
  const next = shallowPatch(node.interactionState, patch);
  if (next === node.interactionState) return;
  recordFieldNodeRevealBaseline(node);
  node.interactionState = next;
};
