import type { BlueprintGate, BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';

/** Immutable authored gate order and membership before live relocation. */
interface StaticGateList {
  /** First occurrence of each gate across child then host declarations. */
  readonly gates: readonly BlueprintGate[];
  /** Membership reused without writing relocated occurrences into it. */
  readonly seenGates: ReadonlySet<BlueprintGate>;
}

/** Blueprint-owned cache; object branch rows return fixed childEntries. */
const STATIC_GATE_LISTS = new WeakMap<BlueprintNode, StaticGateList>();

/**
 * Collect authored gates, caching only hosts with blueprint-fixed child entries.
 * @param node - Host whose behavior owns the child-declaration strategy
 * @returns Immutable static order and membership; arrays are collected every call
 */
export const getStaticGateList = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): StaticGateList => {
  const fixed =
    node.behavior.type === 'object' && node.behavior.strategy === 'branch';
  const cached = fixed ? STATIC_GATE_LISTS.get(node.blueprintNode) : undefined;
  if (cached) return cached;
  const gates: BlueprintGate[] = [];
  const seenGates = new Set<BlueprintGate>();
  const entries = node.behavior.declareChildren(node);
  for (let entryIndex = 0; entryIndex <= entries.length; entryIndex++) {
    const declarations =
      entryIndex < entries.length
        ? entries[entryIndex].declarations
        : node.blueprintNode.declarations;
    for (let index = 0; index < declarations.length; index++) {
      const declaredGates = declarations[index].gates;
      for (let gateIndex = 0; gateIndex < declaredGates.length; gateIndex++) {
        const gate = declaredGates[gateIndex];
        if (!seenGates.has(gate)) {
          seenGates.add(gate);
          gates.push(gate);
        }
      }
    }
  }
  const list: StaticGateList = { gates, seenGates };
  if (fixed) STATIC_GATE_LISTS.set(node.blueprintNode, list);
  return list;
};
