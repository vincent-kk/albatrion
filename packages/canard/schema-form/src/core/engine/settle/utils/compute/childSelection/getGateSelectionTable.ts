import { escapeSegment } from '@winglet/json/pointer';

import type {
  Blueprint,
  BlueprintGate,
  BlueprintNode,
} from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { resolveDependencyPath } from '../../../../utils/paths/resolveDependencyPath';
import type {
  GateSelectionGroup,
  GateSelectionLiteral,
  GateSelectionTable,
} from '../../../types/gateSelectionTable';
import { getGateExpression } from '../../gates/getGateExpression';
import { computeRootGateSelection } from './gateSelection/computeRootGateSelection';
import { getDirectChildSelectionPlan } from './getDirectChildSelectionPlan';

/** Weak host lifetime includes negative eligibility decisions; never retains live nodes. */

/** Construction-only mutable buckets, exposed through readonly table contracts. */
type MutableGateSelectionGroup = Omit<
  GateSelectionGroup,
  'buckets' | 'literalsByGate'
> & {
  buckets: Map<GateSelectionLiteral, number[]>;
  literalsByGate: Map<BlueprintGate, ReadonlySet<GateSelectionLiteral>>;
};

/**
 * Lazily cache E1–E5 metadata without reading values or changing settlement paths.
 * @param host - Immutable blueprint host whose identity owns the cached result
 * @param blueprint - Owning analysis supplying expressions and root identity
 * @returns Static table or cached null when no candidate step is eligible
 */
export const getGateSelectionTable = (
  host: BlueprintNode,
  blueprint: Blueprint,
): GateSelectionTable | null => {
  const cached = getHostDerived<
    'gateSelectionTable',
    GateSelectionTable | null
  >(host).gateSelectionTable;
  if (cached !== undefined) return cached;
  const plan = getDirectChildSelectionPlan(host, blueprint, true);
  if (!plan) {
    getHostDerived<'gateSelectionTable', GateSelectionTable | null>(
      host,
    ).gateSelectionTable = null;
    return null;
  }
  const watchedNames = new Map<string, string>();
  for (const entry of plan.baseline)
    if (entry.node.strategy === 'terminal')
      watchedNames.set(host.path + '/' + escapeSegment(entry.name), entry.name);
  const groups = new Map<string, MutableGateSelectionGroup>();
  const alwaysSteps: number[] = [];
  const stepIndexByName = new Map<string, number>();
  const tableSteps = new Set<number>();
  for (let index = 0; index < plan.steps.length; index++) {
    const step = plan.steps[index];
    const gate = step.gate;
    stepIndexByName.set(step.entry.name, index);
    const expression = gate
      ? getGateExpression(blueprint, gate.schemaPath)
      : undefined;
    const equality = expression?.equality;
    const watchedName =
      equality && expression
        ? watchedNames.get(
            resolveDependencyPath(host.path, expression.dependencies[0]),
          )
        : undefined;
    if (!gate || !equality || watchedName === undefined) {
      alwaysSteps.push(index);
      continue;
    }
    let group = groups.get(watchedName);
    if (!group) {
      group = {
        watchedName,
        firstGate: gate,
        firstStepIndex: index,
        buckets: new Map(),
        literalsByGate: new Map(),
      };
      groups.set(watchedName, group);
    }
    let literals = group.literalsByGate.get(gate);
    if (!literals) {
      literals = new Set(equality.literals);
      group.literalsByGate.set(gate, literals);
    }
    for (const literal of literals) {
      const bucket = group.buckets.get(literal);
      if (bucket) bucket.push(index);
      else group.buckets.set(literal, [index]);
    }
    tableSteps.add(index);
  }
  if (groups.size === 0) {
    getHostDerived<'gateSelectionTable', GateSelectionTable | null>(
      host,
    ).gateSelectionTable = null;
    return null;
  }
  const orderedGroups = [...groups.values()];
  const root = computeRootGateSelection(host, blueprint, orderedGroups);
  const table: GateSelectionTable = {
    plan,
    groups: orderedGroups,
    alwaysSteps,
    stepIndexByName,
    tableSteps,
    ...(root ? { root } : {}),
  };
  getHostDerived<'gateSelectionTable', GateSelectionTable | null>(
    host,
  ).gateSelectionTable = table;
  return table;
};
