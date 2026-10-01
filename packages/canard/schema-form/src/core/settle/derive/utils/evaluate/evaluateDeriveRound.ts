import type { SchemaNodeRecord } from '../../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { DeriveRoundDecision, DeriveState, DeriveTraceEntry,
  DeriveWrite } from '../../type';
import { getDeriveRuleTable } from '../rules/getDeriveRuleTable';
import { getWatchPaths } from '../rules/utils/getWatchPaths';
import { getDeriveRuleKey } from '../edges/getDeriveRuleKey';
import { readDeriveDependency } from './utils/readDeriveDependency';
import { getRuleTargets } from './utils/getRuleTargets';
import { getDeriveSourceNodes } from './utils/getDeriveSourceNodes';
import { evaluateInjectTo } from './utils/evaluateInjectTo';
import { chooseDeriveWrite } from './utils/chooseDeriveWrite';
import { KIND_RANK } from '../rank/kindRank';
import { LAYER_RANK } from '../rank/layerRank';
import { getDeriveSourceOrder } from '../rank/getDeriveSourceOrder';
import { getVirtualWriteFailure } from './utils/getVirtualWriteFailure';
import { evaluateScopedExpression } from './utils/evaluateScopedExpression';
import type { ScopedExpressionResult } from './utils/evaluateScopedExpression';
import { getSelectedDeclarationIds } from './utils/getSelectedDeclarationIds';
import { addActiveRuleKey } from './utils/addActiveRuleKey';

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
  const winners = new Map<string, DeriveWrite<Self>>();
  const trace: DeriveTraceEntry[] = [];
  const traceWinners = new Map<string, number>();
  const evaluatedExpressions = new Map<string, ScopedExpressionResult>();
  let failure: DeriveRoundDecision<Self>['failure'];
  if (!state.sourcePaths) {
    state.activeRuleKeys.clear();
    state.activeRuleKeysBySource.clear();
  }
  state.activeUnsetTargets.clear();
  while (pending.length) {
    const node = pending.pop();
    if (!node || node.detached) continue;
    state.visitedSourcePaths.add(node.path);
    if (state.sourcePaths) {
      const sourceKeys = state.activeRuleKeysBySource.get(node.path);
      if (sourceKeys) {
        for (const key of sourceKeys) state.activeRuleKeys.delete(key);
        state.activeRuleKeysBySource.delete(node.path);
      }
    }
    const selected = getSelectedDeclarationIds(node, state);
    for (const id of selected)
      for (const rule of table.byDeclaration.get(id) ?? []) {
        if (rule.kind === 'resetInteraction') continue;
        const target = rule.kind === 'injectTo' ? node :
          getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(node.path, node.blueprintNode.kind, rule,
          target);
        addActiveRuleKey(state, node.path, key);
        const consumed = state.consumedRuleValues.has(key);
        const priorExists = consumed || state.committedRuleValues.has(key);
        const prior = consumed ? state.consumedRuleValues.get(key) :
          state.committedRuleValues.get(key);
        const load = !consumed && Boolean(state.loadScope &&
          (node.path === state.loadScope.path ||
            node.path.startsWith(`${state.loadScope.path}/`)));
        const appeared = !consumed &&
          (load || state.entered.has(target) || state.revived.has(target));
        if (rule.kind === 'injectTo') {
          const current = node.emit;
          state.consumedRuleValues.set(key, current);
          if (state.loadScope && node.path !== state.loadScope.path &&
            !node.path.startsWith(`${state.loadScope.path}/`)) continue;
          if (!appeared && (!priorExists || sameValue(prior, current))) continue;
          const evaluated = evaluateInjectTo(node, root, rule);
          if (evaluated.failure) {
            if (!failure) failure = evaluated.failure;
            continue;
          }
          for (const candidate of evaluated.writes)
            chooseDeriveWrite(candidate, node.path, state, winners, trace, traceWinners);
          if (evaluated.writes.length === 0 && state.trace)
            trace.push({ phase: 'derive', kind: 'injectTo', sourcePath: node.path,
              targetPath: node.path, previousValue: current, nextValue: undefined,
              result: 'undefined' });
          continue;
        }
        let current: unknown;
        let value: unknown;
        try {
          if (rule.kind === 'derived') {
            const watchDependencies = getWatchPaths(target.blueprintNode);
            current = [
              ...rule.expression?.dependencies.map((dependency) =>
                readDeriveDependency(root, node.path, dependency)) ?? [],
              ...watchDependencies.filter((dependency) =>
                target !== node || !rule.expression?.dependencies.includes(dependency))
                .map((dependency) =>
                  readDeriveDependency(root, target.path, dependency)),
            ];
            if (appeared || (priorExists && !sameValue(prior, current))) {
              const evaluated = evaluateScopedExpression(root, node, rule,
                evaluatedExpressions);
              if (evaluated.threw) throw evaluated.cause;
              value = evaluated.value;
            }
          } else {
            const evaluated = evaluateScopedExpression(root, node, rule,
              evaluatedExpressions);
            if (evaluated.threw) throw evaluated.cause;
            current = Boolean(evaluated.value);
            if (!(current && (appeared || (priorExists && !prior))))
              value = undefined;
          }
        } catch (cause) {
          if (!failure) failure = { sourcePath: node.path,
            schemaPath: rule.schemaPath, cause, kind: 'expression' };
          state.consumedRuleValues.set(key, current);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        if (rule.kind === 'unsetValue' && current)
          state.activeUnsetTargets.add(target);
        const fired = rule.kind === 'derived' ?
          Boolean(appeared || (priorExists && !sameValue(prior, current))) :
          current === true && Boolean(appeared || (priorExists && !prior));
        if (!fired) continue;
        if (rule.kind === 'derived' && value === undefined) {
          if (state.trace) trace.push({ phase: 'derive', kind: rule.kind,
            sourcePath: node.path, targetPath: target.path,
            previousValue: target.emit, nextValue: value, result: 'undefined' });
          continue;
        }
        const candidate: DeriveWrite<Self> = { target, targetPath: target.path,
          value: rule.kind === 'unsetValue' ? undefined : value,
          kind: rule.kind, rank: KIND_RANK[rule.kind], layer: LAYER_RANK[rule.layer],
          sourceOrder: getDeriveSourceOrder(node), ruleOrder: rule.order,
          returnOrder: 0 };
        const invalid = getVirtualWriteFailure(node.path, rule.schemaPath,
          target.path, target.blueprintNode, candidate.value);
        if (invalid) {
          if (!failure) failure = invalid;
          continue;
        }
        chooseDeriveWrite(candidate, node.path, state, winners, trace, traceWinners);
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children![index]);
  }
  return { writes: [...winners.values()], trace, ...(failure ? { failure } : {}) };
};
