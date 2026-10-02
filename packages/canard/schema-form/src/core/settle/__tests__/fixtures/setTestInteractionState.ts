import { accumulateGlobalStateDeltas, publishGlobalStateDeltas } from '../../../record';
import type { NodeStateFlags } from '../../../types/state';
import type { PlainNode } from './createPlainNode';

/** Keep plain-record state setup consistent with the tree's accounted flags. */
export const setTestInteractionState = (node: PlainNode, state: NodeStateFlags): void => {
  const deltas = new Map<string, number>();
  accumulateGlobalStateDeltas(deltas, node.interactionState, state);
  node.interactionState = state;
  publishGlobalStateDeltas(node.rootNode, deltas);
};
