import type { NodeStateFlags } from '../../types/state';
import type { FieldNodeRecord } from '../types/record';
import { shallowPatch } from './shallowPatch';

/** Patch live interaction flags while retaining their reference for a no-op. */
export const patchFieldNodeInteractionState = <Self>(
  node: FieldNodeRecord<Self>,
  patch: Partial<NodeStateFlags>,
): void => {
  if (node.detached) return;
  node.interactionState = shallowPatch(node.interactionState, patch);
};
