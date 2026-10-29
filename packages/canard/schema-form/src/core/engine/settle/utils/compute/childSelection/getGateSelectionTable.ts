import { map as mapArray } from '@winglet/common-utils/array';

import type { Nullable, Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type {
  Blueprint,
  BlueprintGate,
  BlueprintNode,
} from '../../../../blueprint';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { engineModes } from '../../../../utils/cache/engineModes';
import { resolveDependencyPath } from '../../../../utils/paths/resolveDependencyPath';
import type {
  GateSelectionGroup,
  GateSelectionLiteral,
  GateSelectionTable,
} from '../../../types/gateSelectionTable';
import { getGateExpression } from '../../gates/getGateExpression';
import { getIfGateReadNames } from '../../gates/predicates/getIfGateReadNames';
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
 * Admit only the strict primitive keys shared by equality and discriminator tables.
 * @param value - Authored tag; non-finite numbers and composite values stay general
 * @returns Whether a Map key has the exact supported strict-equality semantics
 */
const isGateSelectionLiteral = (
  value: unknown,
): value is GateSelectionLiteral =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

/**
 * Lazily cache E1–E5 metadata without reading values or changing settlement paths.
 * @param host - Immutable blueprint host whose identity owns the cached result
 * @param blueprint - Owning analysis supplying expressions and root identity
 * @returns Static table or cached null when no candidate step is eligible
 */
export const getGateSelectionTable = (
  host: BlueprintNode,
  blueprint: Blueprint,
): Nullable<GateSelectionTable> => {
  const cached = getHostDerived<
    'gateSelectionTable',
    Nullable<GateSelectionTable>
  >(host).gateSelectionTable;
  if (cached !== undefined) return cached;
  const plan = getDirectChildSelectionPlan(host, blueprint, true);
  if (!plan) {
    getHostDerived<'gateSelectionTable', Nullable<GateSelectionTable>>(
      host,
    ).gateSelectionTable = null;
    return null;
  }
  const watchedNames = new Map<string, string>();
  for (const entry of plan.baseline)
    if (entry.node.strategy === 'terminal')
      watchedNames.set(appendSegment(host.path, entry.name), entry.name);
  const groups = new Map<string, MutableGateSelectionGroup>();
  const alwaysSteps: number[] = [];
  const stableSchemaNames: string[] = [];
  const stepIndexByName = new Map<string, number>();
  const tableSteps = new Set<number>();
  const predicateGroups = new Map<
    BlueprintGate,
    { gate: BlueprintGate; steps: number[]; watchedNames: readonly string[] }
  >();
  for (let index = 0; index < plan.steps.length; index++) {
    const step = plan.steps[index];
    if (step.general) stableSchemaNames.push(step.entry.name);
    const gate = step.gate;
    stepIndexByName.set(step.entry.name, index);
    const expression = gate
      ? getGateExpression(blueprint, gate.schemaPath)
      : undefined;
    const equality =
      gate?.kind === 'discriminator' && isGateLiteralList(gate.condition.values)
        ? { literals: gate.condition.values }
        : expression?.equality;
    const watchedName =
      gate?.kind === 'discriminator'
        ? watchedNames.get(
            appendSegment(host.path, gate.condition.propertyName),
          )
        : equality && expression
          ? watchedNames.get(
              resolveDependencyPath(host.path, expression.dependencies[0]),
            )
          : undefined;
    const ifReads =
      gate?.kind === 'if'
        ? getIfGateReadNames(gate.condition, blueprint)
        : engineModes.gatePredicate !== 'off' &&
            expression?.completeReads &&
            !equality
          ? mapArray(expression.dependencies, (dependency) =>
              watchedNames.get(resolveDependencyPath(host.path, dependency)),
            )
          : undefined;
    if (
      gate &&
      ifReads &&
      hasOnlyWatchedReadNames(ifReads, watchedNames, host.path)
    ) {
      let group = predicateGroups.get(gate);
      if (!group) {
        group = { gate, steps: [], watchedNames: ifReads };
        predicateGroups.set(gate, group);
      }
      group.steps.push(index);
      tableSteps.add(index);
      continue;
    }
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
  for (const [gate, group] of predicateGroups)
    if (
      group.steps[group.steps.length - 1] - group.steps[0] + 1 !==
      group.steps.length
    ) {
      for (const index of group.steps) {
        alwaysSteps.push(index);
        tableSteps.delete(index);
      }
      predicateGroups.delete(gate);
    }
  alwaysSteps.sort((left, right) => left - right);
  if (groups.size === 0 && predicateGroups.size === 0) {
    getHostDerived<'gateSelectionTable', Nullable<GateSelectionTable>>(
      host,
    ).gateSelectionTable = null;
    return null;
  }
  const orderedGroups = [...groups.values()];
  const roundWatchedNames = mapArray(
    orderedGroups,
    (group) => group.watchedName,
  );
  for (const group of predicateGroups.values())
    for (const name of group.watchedNames)
      if (roundWatchedNames.indexOf(name) === -1) roundWatchedNames.push(name);
  const root = computeRootGateSelection(host, blueprint, orderedGroups);
  const table: GateSelectionTable = {
    watchedNames: roundWatchedNames,
    stableSchemaNames,
    predicateGroups: [...predicateGroups.values()],
    plan,
    groups: orderedGroups,
    alwaysSteps,
    stepIndexByName,
    tableSteps,
    ...(root ? { root } : {}),
  };
  getHostDerived<'gateSelectionTable', Nullable<GateSelectionTable>>(
    host,
  ).gateSelectionTable = table;
  return table;
};

/** Narrow the dense discriminator tags copied during blueprint construction.
 * @param values Dense frozen discriminator tags copied at blueprint time.
 * @returns Whether every present tag has strict Map-key semantics.
 */
function isGateLiteralList(
  values: readonly unknown[],
): values is readonly GateSelectionLiteral[] {
  for (let index = 0, length = values.length; index < length; index++)
    if (index in values && !isGateSelectionLiteral(values[index])) return false;
  return true;
}
/** Prove every generated read resolves to a watched terminal.
 * @param names Dense compiled read names, including unresolved entries.
 * @param watched Existing terminal path index.
 * @param hostPath Host used to resolve authored names.
 * @returns Whether the existing names can be retained as complete watched reads.
 */
function hasOnlyWatchedReadNames(
  names: readonly Optional<string>[],
  watched: ReadonlyMap<string, string>,
  hostPath: string,
): names is readonly string[] {
  for (const name of names)
    if (name === undefined || !watched.has(appendSegment(hostPath, name)))
      return false;
  return true;
}
