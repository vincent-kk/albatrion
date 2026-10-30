import {
  appendSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintGate,
  PropertyDeclaration,
} from '../../../blueprint';
import type { TreeMemoStores } from '../../../types/treeMemoStores';
import { getBlueprintDerived } from '../../../utils/cache/derivedRecords';

interface GateBudgetIndex {
  /** Authored decisions reached by each evaluated gate. */
  readonly decisionsByGate: ReadonlyMap<BlueprintGate, ReadonlySet<string>>;
  /** Whole-analysis transition ceiling. */
  readonly transitionCap: number;
}

/** One finite decision index per immutable analysis and one ceiling per live host. */

/** Map evaluated gates to their owning fragments or node-gate entries. */
const getIndex = (blueprint: Blueprint): GateBudgetIndex => {
  const cached = getBlueprintDerived<'gateBudgetIndex', GateBudgetIndex>(
    blueprint,
  ).gateBudgetIndex;
  if (cached) return cached;
  const decisionsByGate = new Map<BlueprintGate, Set<string>>();
  const decisions = new Set<string>();
  const fieldControls = new Map<BlueprintGate, boolean>();
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
        add(gate, 'fragment:' + declaration.fragmentId);
    for (const gate of declaration.gates) {
      if (gate.kind !== 'active') continue;
      let fieldControl = fieldControls.get(gate);

      if (fieldControl === undefined) {
        const segments = parsePointerSegments(gate.schemaPath);
        let matches =
          segments[segments.length - 2] === 'controls' &&
          segments[segments.length - 1] === 'active';
        if (matches) {
          matches = false;
          for (let index = 0, count = segments.length; index < count; index++) {
            const segment = segments[index];

            if (segment === 'controls' && segments[index + 1] === 'fields') {
              matches = true;
              break;
            }
          }
        }
        fieldControl = matches;
        fieldControls.set(gate, fieldControl);
      }
      if (fieldControl) add(gate, 'node:' + gate.schemaPath);
      else if (
        declaration.scope === 'node' &&
        gate.schemaPath ===
          appendSegment(
            appendSegment(declaration.schemaPath, 'controls'),
            'active',
          )
      )
        add(gate, 'node:' + gate.schemaPath);
    }
  };
  for (const node of blueprint.nodes) {
    for (const declaration of node.declarations) collect(declaration);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations) collect(declaration);
  }
  const index = { decisionsByGate, transitionCap: decisions.size + 1 };
  getBlueprintDerived<'gateBudgetIndex', GateBudgetIndex>(
    blueprint,
  ).gateBudgetIndex = index;
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
  runtime: Pick<TreeMemoStores<unknown, BlueprintGate>, 'hostBudgetCaps'>,
): number => {
  if (blueprint.capabilities.branchless) return 1;
  const cached = runtime.hostBudgetCaps?.get(host);
  if (cached && cached.gates.length === gates.length) {
    let unchanged = true;
    for (let index = 0; index < cached.gates.length; index++)
      if (cached.gates[index] !== gates[index]) {
        unchanged = false;
        break;
      }
    if (unchanged) return cached.cap;
  }
  const index = getIndex(blueprint);
  const decisions = new Set<string>();
  for (const gate of gates)
    for (const key of index.decisionsByGate.get(gate) ?? []) decisions.add(key);
  const cap = decisions.size + 1;
  (runtime.hostBudgetCaps ??= new WeakMap()).set(host, {
    gates: [...gates],
    cap,
  });
  return cap;
};
