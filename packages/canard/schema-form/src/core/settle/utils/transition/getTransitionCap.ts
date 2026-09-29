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
  const gates: BlueprintGate[] = [];
  for (const node of blueprint.nodes)
    for (const declaration of [...node.declarations,
      ...node.childEntries.flatMap((entry) => entry.declarations)])
      for (const gate of declaration.gates)
        if (!gates.includes(gate)) gates.push(gate);
  const cap = gates.length + 1;
  CAPS.set(blueprint, cap);
  return cap;
};
