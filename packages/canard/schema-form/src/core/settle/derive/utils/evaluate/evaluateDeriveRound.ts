import type { SchemaNodeRecord } from '../../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { DeriveRoundDecision, DeriveState, DeriveTraceEntry,
  DeriveWrite } from '../../type';
import { getDeriveRuleTable } from '../rules/getDeriveRuleTable';
import { getDeriveRuleKey } from '../edges/getDeriveRuleKey';
import { readDeriveDependency } from './utils/readDeriveDependency';
import { getRuleTargets } from './utils/getRuleTargets';
import { getDeriveSourceNodes } from './utils/getDeriveSourceNodes';

/** Higher automatic rule wins when two first-unit rules address one node. */
const PRIORITY = { derived: 3, injectTo: 2, unsetValue: 4 } as const;

/**
 * Consume active derived and unsetValue edges in the completed current shape.
 * @param root - Live calculated root whose projected output is current
 * @param state - Commit and call-local rule baselines without settlement imports
 * @returns Candidate writes, optional trace entries, and an authored failure
 */
export const evaluateDeriveRound = <Self extends SchemaNodeRecord<Self>>(
  root: Self, state: DeriveState<Self>,
): DeriveRoundDecision<Self> => {
  const table = getDeriveRuleTable(root.runtime.blueprint);
  if (table.rules.length === 0) return { writes: [], trace: [] };
  const pending = getDeriveSourceNodes(root, state);
  const winners = new Map<Self, DeriveWrite<Self>>();
  const trace: DeriveTraceEntry[] = [];
  const traceWinners = new Map<Self, number>();
  let failure: DeriveRoundDecision<Self>['failure'];
  if (!state.sourcePaths) state.activeRuleKeys.clear();
  state.activeUnsetTargets.clear();
  while (pending.length) {
    const node = pending.pop();
    if (!node || node.detached) continue;
    state.visitedSourcePaths.add(node.path);
    if (state.sourcePaths)
      for (const key of state.activeRuleKeys)
        if (key.startsWith(`[${JSON.stringify(node.path)},`))
          state.activeRuleKeys.delete(key);
    const selected = state.selectedDeclarationIds.get(node) ??
      node.blueprintNode.declarations.map((declaration) => declaration.id);
    for (const id of selected)
      for (const rule of table.byDeclaration.get(id) ?? []) {
        if (rule.kind === 'resetInteraction' || rule.kind === 'injectTo') continue;
        const target = getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(node.path, node.blueprintNode.kind, rule);
        state.activeRuleKeys.add(key);
        const consumed = state.consumedRuleValues.has(key);
        const priorExists = consumed || state.committedRuleValues.has(key);
        const prior = consumed ? state.consumedRuleValues.get(key) :
          state.committedRuleValues.get(key);
        const load = !consumed && state.loadScope && (node.path === state.loadScope.path ||
          node.path.startsWith(`${state.loadScope.path}/`));
        let current: unknown;
        let value: unknown;
        try {
          if (rule.kind === 'derived') {
            current = [
              ...rule.expression?.dependencies.map((dependency) =>
                readDeriveDependency(root, node.path, dependency)) ?? [],
              ...rule.watchDependencies.filter((dependency) =>
                target !== node || !rule.expression?.dependencies.includes(dependency))
                .map((dependency) =>
                  readDeriveDependency(root, target.path, dependency)),
            ];
            if (load || !priorExists || !sameValue(prior, current))
              value = rule.expression?.evaluate(rule.expression.dependencies.map(
                (dependency) => readDeriveDependency(root, node.path, dependency)));
          } else {
            current = Boolean(rule.expression ? rule.expression.evaluate(
              rule.expression.dependencies.map((dependency) =>
                readDeriveDependency(root, node.path, dependency))) : rule.literal);
            if (!(current && (load || !priorExists || !prior)))
              value = undefined;
          }
        } catch (cause) {
          if (!failure) failure = { sourcePath: node.path,
            schemaPath: rule.schemaPath, cause };
          state.consumedRuleValues.set(key, current);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        if (rule.kind === 'unsetValue' && current)
          state.activeUnsetTargets.add(target);
        const fired = rule.kind === 'derived' ?
          Boolean(load || !priorExists || !sameValue(prior, current)) :
          current === true && Boolean(load || !priorExists || !prior);
        if (!fired) continue;
        if (rule.kind === 'derived' && value === undefined) {
          if (state.trace) trace.push({ phase: 'derive', kind: rule.kind,
            sourcePath: node.path, targetPath: target.path,
            previousValue: target.emit, nextValue: value, result: 'undefined' });
          continue;
        }
        const layer = rule.layer === 'node' ? 3 : rule.layer === 'children' ? 2 : 1;
        const candidate: DeriveWrite<Self> = { target,
          value: rule.kind === 'unsetValue' ? undefined : value,
          kind: rule.kind, layer };
        const priorWinner = winners.get(target);
        const wins = !state.suppressAutomaticWrites && (!priorWinner ||
          PRIORITY[candidate.kind] > PRIORITY[priorWinner.kind] ||
          PRIORITY[candidate.kind] === PRIORITY[priorWinner.kind] &&
            candidate.layer >= priorWinner.layer);
        if (wins) {
          const previousIndex = traceWinners.get(target);
          if (previousIndex !== undefined)
            trace[previousIndex] = { ...trace[previousIndex], result: 'lost' };
          winners.set(target, candidate);
          if (state.trace) traceWinners.set(target, trace.length);
        }
        if (state.trace) trace.push({ phase: 'derive', kind: rule.kind,
          sourcePath: node.path, targetPath: target.path, previousValue: target.emit,
          nextValue: candidate.value,
          result: state.suppressAutomaticWrites ? 'suppressed' :
            wins ? 'applied' : 'lost' });
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children![index]);
  }
  return { writes: [...winners.values()], trace, ...(failure ? { failure } : {}) };
};
