import type { FieldNodeRecord } from '../../record';
import { sameValue } from '../../utils/compute/sameValue';
import type {
  DeriveRoundDecision,
  DeriveTraceEntry,
  DeriveWrite,
} from '../types/decisions';
import type { DeriveState } from '../types/state';
import { addActiveRuleKey } from '../utils/evaluate/addActiveRuleKey';
import { evaluateScopedExpression } from '../utils/evaluate/evaluateScopedExpression';
import type { ScopedExpressionResult } from '../utils/evaluate/evaluateScopedExpression';
import { getDeriveSourceNodes } from '../utils/evaluate/getDeriveSourceNodes';
import { getRuleTargets } from '../utils/evaluate/getRuleTargets';
import { getSelectedDeclarationIds } from '../utils/evaluate/getSelectedDeclarationIds';
import { readDeriveDependency } from '../utils/evaluate/readDeriveDependency';
import { getDeriveRuleKey } from '../utils/rules/getDeriveRuleKey';
import { getDeriveRuleTable } from '../utils/rules/getDeriveRuleTable';
import { getWatchPaths } from '../utils/rules/getWatchPaths';
import { evaluateInjectTo } from './utils/inject/evaluateInjectTo';
import { getDeriveSourceOrder } from './utils/rank/getDeriveSourceOrder';
import { KIND_RANK } from './utils/rank/kindRank';
import { LAYER_RANK } from './utils/rank/layerRank';
import { chooseDeriveWrite } from './utils/writes/chooseDeriveWrite';
import { getVirtualWriteFailure } from './utils/writes/getVirtualWriteFailure';

/** Frozen result reused when no expression fails. */
const NO_FAILURES: readonly [] = Object.freeze([]);

/** Shared frozen decision for a blueprint without derive rules. */
const EMPTY_DECISION: DeriveRoundDecision<never> = Object.freeze({
  writes: Object.freeze([]),
  trace: Object.freeze([]),
  failures: NO_FAILURES,
});

/**
 * Consume active derived and unsetValue edges in the completed current shape.
 * @param root - Live calculated root whose projected output is current
 * @param state - Commit and call-local rule baselines without settlement imports
 * @returns Candidate writes, optional trace entries, and all authored failures
 */
export const evaluateDeriveRound = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  state: DeriveState<Self>,
): DeriveRoundDecision<Self> => {
  const table = getDeriveRuleTable(root.runtime.blueprint);
  if (table.rules.length === 0) return EMPTY_DECISION;
  const pending = getDeriveSourceNodes(root, state);
  const winners = new Map<string, DeriveWrite<Self>>();
  const trace: DeriveTraceEntry[] = [];
  const traceWinners = new Map<string, number>();
  const evaluatedExpressions = new Map<string, ScopedExpressionResult>();
  let failures: DeriveRoundDecision<Self>['failures'][number][] | undefined;
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
        const target =
          rule.kind === 'injectTo'
            ? node
            : getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(
          node.path,
          node.blueprintNode.kind,
          rule,
          target,
        );
        addActiveRuleKey(state, node.path, key);
        const consumed = state.consumedRuleValues.has(key);
        const priorExists = consumed || state.committedRuleValues.has(key);
        const prior = consumed
          ? state.consumedRuleValues.get(key)
          : state.committedRuleValues.get(key);
        const load =
          !consumed &&
          Boolean(
            state.loadScope &&
              (node.path === state.loadScope.path ||
                node.path.startsWith(state.loadScope.path + '/')),
          );
        const appeared =
          !consumed &&
          (load || state.entered.has(target) || state.revived.has(target));
        if (rule.kind === 'injectTo') {
          const current = node.emit;
          state.consumedRuleValues.set(key, current);
          if (
            state.loadScope &&
            node.path !== state.loadScope.path &&
            !node.path.startsWith(state.loadScope.path + '/')
          )
            continue;
          if (!appeared && (!priorExists || sameValue(prior, current)))
            continue;
          const evaluated = evaluateInjectTo(node, root, rule);
          if (evaluated.failure) {
            (failures ??= []).push(evaluated.failure);
            continue;
          }
          for (const candidate of evaluated.writes)
            chooseDeriveWrite(
              candidate,
              node.path,
              state,
              winners,
              trace,
              traceWinners,
            );
          if (evaluated.writes.length === 0 && state.trace)
            trace.push({
              phase: 'derive',
              kind: 'injectTo',
              sourcePath: node.path,
              targetPath: node.path,
              previousValue: current,
              nextValue: undefined,
              result: 'undefined',
            });
          continue;
        }
        let current: unknown;
        let value: unknown;
        try {
          if (rule.kind === 'derived') {
            const watchDependencies = getWatchPaths(target.blueprintNode);
            current = [
              ...(rule.expression?.dependencies.map((dependency) =>
                readDeriveDependency(root, node.path, dependency),
              ) ?? []),
              ...watchDependencies
                .filter(
                  (dependency) =>
                    target !== node ||
                    !rule.expression?.dependencies.includes(dependency),
                )
                .map((dependency) =>
                  readDeriveDependency(root, target.path, dependency),
                ),
            ];
            if (appeared || (priorExists && !sameValue(prior, current))) {
              const evaluated = evaluateScopedExpression(
                root,
                node,
                rule,
                evaluatedExpressions,
              );
              if (evaluated.threw) throw evaluated.cause;
              value = evaluated.value;
            }
          } else {
            const evaluated = evaluateScopedExpression(
              root,
              node,
              rule,
              evaluatedExpressions,
            );
            if (evaluated.threw) throw evaluated.cause;
            current = Boolean(evaluated.value);
            if (!(current && (appeared || (priorExists && !prior))))
              value = undefined;
          }
        } catch (cause) {
          (failures ??= []).push({
            sourcePath: node.path,
            schemaPath: rule.schemaPath,
            cause,
            kind: 'expression',
          });
          state.consumedRuleValues.set(key, current);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        if (rule.kind === 'unsetValue' && current)
          state.activeUnsetTargets.add(target);
        const fired =
          rule.kind === 'derived'
            ? Boolean(appeared || (priorExists && !sameValue(prior, current)))
            : current === true && Boolean(appeared || (priorExists && !prior));
        if (!fired) continue;
        if (rule.kind === 'derived' && value === undefined) {
          if (state.trace)
            trace.push({
              phase: 'derive',
              kind: rule.kind,
              sourcePath: node.path,
              targetPath: target.path,
              previousValue: target.emit,
              nextValue: value,
              result: 'undefined',
            });
          continue;
        }
        const candidate: DeriveWrite<Self> = {
          target,
          targetPath: target.path,
          value: rule.kind === 'unsetValue' ? undefined : value,
          kind: rule.kind,
          rank: KIND_RANK[rule.kind],
          layer: LAYER_RANK[rule.layer],
          sourceOrder: getDeriveSourceOrder(node),
          ruleOrder: rule.order,
          returnOrder: 0,
        };
        const invalid = getVirtualWriteFailure(
          node.path,
          rule.schemaPath,
          target.path,
          target.blueprintNode,
          candidate.value,
        );
        if (invalid) {
          (failures ??= []).push(invalid);
          continue;
        }
        chooseDeriveWrite(
          candidate,
          node.path,
          state,
          winners,
          trace,
          traceWinners,
        );
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children![index]);
  }
  return {
    writes: [...winners.values()],
    trace,
    failures: failures ?? NO_FAILURES,
  };
};
