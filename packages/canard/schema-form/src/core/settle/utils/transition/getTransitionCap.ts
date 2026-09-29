import type { Blueprint, BlueprintGate } from '../../../blueprint';

/** Cached finite gate counts shared by every write against one analysis. */
const CAPS = new WeakMap<Blueprint, number>();

/**
 * Count distinct authored gates once for the transition round ceiling.
 * @param blueprint - Immutable analyzed schema shared by the tree
 * @returns Gated fragments plus node gates plus the final settling round
 */
export const getTransitionCap = (blueprint: Blueprint): number => {
  const cached = CAPS.get(blueprint);
  if (cached !== undefined) return cached;
  const gates = new Set<BlueprintGate>();
  for (const node of blueprint.nodes) {
    for (const declaration of node.declarations)
      for (const gate of declaration.gates) gates.add(gate);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates) gates.add(gate);
  }
  const cap = gates.size + 1;
  CAPS.set(blueprint, cap);
  return cap;
};
