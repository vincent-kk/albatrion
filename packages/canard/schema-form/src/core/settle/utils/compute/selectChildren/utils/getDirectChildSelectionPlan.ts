import { hasOwnProperty } from '@winglet/common-utils/lib';
import { isArray } from '@winglet/common-utils/filter';

import type { Blueprint, BlueprintChildEntry, BlueprintGate, BlueprintNode } from '../../../../../blueprint';
import { getGateExpression } from '../../../gates/getGateExpression';

/** One authored evaluation position; its condition still runs on every visit. */
interface DirectChildSelection {
  /** Original edge retained for creation and inactive-exit handling. */
  readonly entry: BlueprintChildEntry;
  /** Inherited host gate, absent for an ungated declaration. */
  readonly gate: BlueprintGate | undefined;
  /** Stable declaration-ID list for an admitted edge. */
  readonly ids: readonly number[];
}

/** Single-reader metadata containing no live value or gate result. */
interface DirectChildSelectionPlan {
  /** Evaluation positions in authored candidate order. */
  readonly steps: readonly DirectChildSelection[];
  /** Ungated candidates in their original baseline order. */
  readonly baseline: readonly BlueprintChildEntry[];
}

/**
 * Prepared plans, or null for a host the general selector keeps; immutable blueprint
 * hosts own the lifetime and live records are never retained. Callers read an entry
 * here first and call {@link getDirectChildSelectionPlan} only while it is `undefined`.
 */
export const DIRECT_CHILD_SELECTION_PLANS = new WeakMap<BlueprintNode, DirectChildSelectionPlan | null>();

/**
 * Read a prepared baseline or lazily prepare eligible multi-branch union candidates.
 * A prepared decision, including null for an ineligible host, is cached; an unprepared
 * read leaves the entry absent so a later selection can still prepare it.
 * @param host - Immutable object host providing authored candidates
 * @param blueprint - Owning analysis providing compiled expression descriptors
 * @param prepare - True only during a non-load selection that visits the candidates
 * @returns Ordered metadata, or null when the general selector remains necessary
 */
export const getDirectChildSelectionPlan = (
  host: BlueprintNode,
  blueprint: Blueprint,
  prepare: boolean,
): DirectChildSelectionPlan | null => {
  const cached = DIRECT_CHILD_SELECTION_PLANS.get(host);
  if (cached !== undefined) return cached;
  if (!prepare) return null;
  const schema = host.declarations[0]?.schema;
  if (typeof schema !== 'object' || schema === null ||
    !((isArray(schema.oneOf) && schema.oneOf.length > 1) ||
      (isArray(schema.anyOf) && schema.anyOf.length > 1))) {
    DIRECT_CHILD_SELECTION_PLANS.set(host, null);
    return null;
  }
  const steps: DirectChildSelection[] = [];
  const baseline: BlueprintChildEntry[] = [];
  const names: Record<string, true> = Object.create(null);
  for (let index = 0; index < host.childEntries.length; index++) {
    const entry = host.childEntries[index];
    const declarations = entry.declarations;
    if (hasOwnProperty(names, entry.name) || declarations.length !== 1 ||
      entry.node.kind === 'virtual' || entry.node.childEntries.length > 0 ||
      entry.node.item || entry.node.prefixItems?.length ||
      entry.node.declarations.length !== 1 || entry.node.declarations[0].id !== declarations[0].id ||
      declarations[0].gates.length > 1 ||
      entry.node.declarations[0].gates.length !== declarations[0].gates.length ||
      entry.node.declarations[0].gates[0] !== declarations[0].gates[0]) {
      DIRECT_CHILD_SELECTION_PLANS.set(host, null);
      return null;
    }
    const declaration = declarations[0];
    const gate = declaration.gates[0];
    if (gate) {
      const expression = getGateExpression(blueprint, gate.schemaPath);
      if (gate.kind !== 'active' || gate.appliesWhen?.length ||
        gate.hostPath !== host.path ||
        gate.schemaPath === `${declaration.schemaPath}/controls/active` ||
        !expression || expression.dependencies.length !== 1) {
        DIRECT_CHILD_SELECTION_PLANS.set(host, null);
        return null;
      }
    } else baseline.push(entry);
    names[entry.name] = true;
    steps.push({ entry, gate, ids: [declaration.id] });
  }
  const plan = { steps, baseline };
  DIRECT_CHILD_SELECTION_PLANS.set(host, plan);
  return plan;
};
