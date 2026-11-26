import type { NodeStateFlags } from '../../types/state';
import type { FieldNodeRecord } from '../types/record';
import { recordFieldNodeRevealBaseline } from './recordFieldNodeRevealBaseline';
import { shallowPatch } from './shallowPatch';

/** Patch live interaction flags while retaining their reference for a no-op. */
export const patchFieldNodeInteractionState = <Self>(
  node: FieldNodeRecord<Self>,
  patch: Partial<NodeStateFlags>,
): void => {
  if (node.isDetached) return;
  const next = shallowPatch(node.__state__, patch);
  if (next === node.__state__) return;
  recordFieldNodeRevealBaseline(node);
  node.__state__ = next;
};
