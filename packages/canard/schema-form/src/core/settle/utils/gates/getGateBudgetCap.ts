import type { Blueprint, BlueprintGate, PropertyDeclaration } from '../../../blueprint';

interface GateBudgetIndex {
  /** Authored decisions reached by each evaluated gate. */
  readonly decisionsByGate: ReadonlyMap<BlueprintGate, ReadonlySet<string>>;
  /** Whole-analysis transition ceiling. */
  readonly transitionCap: number;
}

interface HostBudgetCache {
  /** Gate identities in the host's last evaluated order. */
  readonly gates: readonly BlueprintGate[];
  /** Ceiling for that exact gate list. */
  readonly cap: number;
}

/** One finite decision index per immutable analysis and one ceiling per live host. */
const INDICES = new WeakMap<Blueprint, GateBudgetIndex>();
const HOST_CAPS = new WeakMap<object, HostBudgetCache>();

/** Map evaluated gates to their owning fragments or node-gate entries. */
const getIndex = (blueprint: Blueprint): GateBudgetIndex => {
  const cached = INDICES.get(blueprint);
  if (cached) return cached;
  const decisionsByGate = new Map<BlueprintGate, Set<string>>();
  const decisions = new Set<string>();
  const add = (gate: BlueprintGate, key: string): void => {
    let keys = decisionsByGate.get(gate);
    if (!keys) {
      keys = new Set<string>();
      decisionsByGate.set(gate, keys);
    }
    keys.add(key);
    decisions.add(key);
  };
  const collect = (declaration: PropertyDeclaration): void => {
    if (declaration.scope === 'fragment' && declaration.gates.length > 0)
      for (const gate of declaration.gates)
        add(gate, `fragment:${declaration.fragmentId}`);
    for (const gate of declaration.gates) {
      if (gate.kind !== 'active') continue;
      if (gate.schemaPath.includes('/controls/children/') &&
        gate.schemaPath.endsWith('/controls/active'))
        add(gate, `node:${gate.schemaPath}`);
      else if (declaration.scope === 'node' &&
        gate.schemaPath === `${declaration.schemaPath}/controls/active`)
        add(gate, `node:${gate.schemaPath}`);
    }
  };
  for (const node of blueprint.nodes) {
    for (const declaration of node.declarations) collect(declaration);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations) collect(declaration);
  }
  const index = { decisionsByGate, transitionCap: decisions.size + 1 };
  INDICES.set(blueprint, index);
  return index;
};

/** Count authored decisions across the finite analysis once per tree. */
export const getTransitionBudgetCap = (blueprint: Blueprint): number =>
  blueprint.capabilities.branchless ? 1 : getIndex(blueprint).transitionCap;

/** Reuse one host ceiling until its relocated gate list changes. */
export const getHostWheelBudgetCap = (
  host: object,
  blueprint: Blueprint,
  gates: readonly BlueprintGate[],
): number => {
  if (blueprint.capabilities.branchless) return 1;
  const cached = HOST_CAPS.get(host);
  if (cached && cached.gates.length === gates.length &&
    cached.gates.every((gate, index) => gate === gates[index])) return cached.cap;
  const index = getIndex(blueprint);
  const decisions = new Set<string>();
  for (const gate of gates)
    for (const key of index.decisionsByGate.get(gate) ?? []) decisions.add(key);
  const cap = decisions.size + 1;
  HOST_CAPS.set(host, { gates: [...gates], cap });
  return cap;
};
