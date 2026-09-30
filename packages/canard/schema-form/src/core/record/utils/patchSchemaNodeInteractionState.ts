import type { NodeStateFlags } from '../../types/state';
import type { SchemaNodeRecord } from '../type';
import { shallowPatch } from './shallowPatch';

/** Patch live interaction flags while retaining their reference for a no-op. */
export const patchSchemaNodeInteractionState = <Self>(
  node: SchemaNodeRecord<Self>,
  patch: Partial<NodeStateFlags>,
): void => {
  if (node.detached) return;
  node.state = shallowPatch(node.state, patch);
};
