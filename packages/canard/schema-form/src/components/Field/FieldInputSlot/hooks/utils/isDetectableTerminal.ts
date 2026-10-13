import type { FieldNode } from '@/schema-form/core';

/**
 * Whether a terminal node's input can mistakenly read ChildNodeComponents (round 180).
 * Only an object or array node can be made terminal by an inline input while a container
 * input for the same schema would render children; string, number, boolean, null and union
 * nodes are terminal by nature, so a shared input reading the empty list there is no mistake.
 * @param node - Live node whose input receives ChildNodeComponents
 * @returns `true` for an object or array node rendered with the terminal strategy
 */
export const isDetectableTerminal = (node: FieldNode): boolean =>
  node.strategy === 'terminal' &&
  (node.type === 'object' || node.type === 'array');
