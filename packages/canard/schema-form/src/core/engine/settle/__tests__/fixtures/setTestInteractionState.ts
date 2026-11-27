import {
  accumulateGlobalStateDeltas,
  publishGlobalStateDeltas,
} from '@/schema-form/core/engine/record';
import type { NodeStateFlags } from '@/schema-form/core/engine/types/state';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';

/** Keep plain-record state setup consistent with the tree's accounted flags. */
export const setTestInteractionState = (
  node: PlainNode,
  state: NodeStateFlags,
): void => {
  const deltas = new Map<string, number>();
  accumulateGlobalStateDeltas(deltas, node.__state__, state);
  node.__state__ = state;
  publishGlobalStateDeltas(node.rootNode, deltas);
};
