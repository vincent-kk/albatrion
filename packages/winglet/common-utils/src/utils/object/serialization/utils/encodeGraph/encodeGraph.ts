import type {
  GraphNode,
  Token,
  TraversalOptions,
  TraversalState,
} from './type';
import { encodeNode } from './utils/encodeNode';
import { toToken } from './utils/toToken';

/** Builds a flat reference table iteratively, preserving deep and cyclic inputs. */
export function encodeGraph(
  value: unknown,
  options: TraversalOptions = {},
): [Token, GraphNode[]] {
  const state: TraversalState = {
    objects: [],
    seen: new Map(),
    options,
    entries: 0,
    arrayLength: 0,
  };
  const root = toToken(value, state);
  const nodes: GraphNode[] = [];
  for (let index = 0; index < state.objects.length; index++) {
    try {
      nodes.push(encodeNode(state.objects[index], state));
    } catch (error) {
      throw new TypeError(`Invalid graph node ${index}: ${String(error)}`);
    }
  }
  return [root, nodes];
}
