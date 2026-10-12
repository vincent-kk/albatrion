import type { SchemaNodeRecord } from '../../../../record';
import type { DeriveResetInteractionDecision, DeriveState,
  DeriveTraceEntry } from '../../type';
import { getDeriveRuleTable } from '../rules/getDeriveRuleTable';
import { getDeriveRuleKey } from '../edges/getDeriveRuleKey';
import { getRuleTargets } from './utils/getRuleTargets';
import { getDeriveSourceNodes } from './utils/getDeriveSourceNodes';
import { evaluateScopedExpression } from './utils/evaluateScopedExpression';
import type { ScopedExpressionResult } from './utils/evaluateScopedExpression';
import { getSelectedDeclarationIds } from './utils/getSelectedDeclarationIds';
import { addActiveRuleKey } from './utils/addActiveRuleKey';

/** Frozen result reused when no expression fails. */
const NO_FAILURES: readonly [] = Object.freeze([]);

/**
 * Decide final interaction resets from loaded values or false-to-true edges.
 * @param root - Final calculated tree whose raw values remain untouched
 * @param state - Last commit and current settlement rule values
 * @returns Nodes to clear, optional trace, and all authored expression failures
 */
export const evaluateResetInteraction = <Self extends SchemaNodeRecord<Self>>(
  root: Self, state: DeriveState<Self>,
): DeriveResetInteractionDecision<Self> => {
  const table = getDeriveRuleTable(root.runtime.blueprint);
  const pending = getDeriveSourceNodes(root, state);
  const nodes: Self[] = [];
  const trace: DeriveTraceEntry[] = [];
  const evaluatedExpressions = new Map<string, ScopedExpressionResult>();
  let failures: DeriveResetInteractionDecision<Self>['failures'][number][] | undefined;
  while (pending.length) {
    const node = pending.pop();
    if (!node || node.detached) continue;
    state.visitedSourcePaths.add(node.path);
    const selected = getSelectedDeclarationIds(node, state);
    for (const id of selected)
      for (const rule of table.byDeclaration.get(id) ?? []) {
        if (rule.kind !== 'resetInteraction') continue;
        const target = getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(node.path, node.blueprintNode.kind, rule,
          target);
        addActiveRuleKey(state, node.path, key);
        const previous = state.committedRuleValues.get(key);
        const previousExists = state.committedRuleValues.has(key);
        let current: boolean;
        try {
          const evaluated = evaluateScopedExpression(root, node, rule,
            evaluatedExpressions);
          if (evaluated.threw) throw evaluated.cause;
          current = Boolean(evaluated.value);
        } catch (cause) {
          (failures ??= []).push({ sourcePath: node.path,
            schemaPath: rule.schemaPath, cause });
          state.consumedRuleValues.set(key, false);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        const load = state.loadScope && (node.path === state.loadScope.path ||
          node.path.startsWith(`${state.loadScope.path}/`));
        if (!current || !(load || state.entered.has(target) ||
          state.revived.has(target) || (previousExists && !previous))) continue;
        if (!nodes.includes(target)) nodes.push(target);
        if (state.trace) trace.push({ phase: 'commit', kind: rule.kind,
          sourcePath: node.path, targetPath: target.path,
          previousValue: previous, nextValue: current, result: 'applied' });
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children![index]);
  }
  return { nodes, trace, failures: failures ?? NO_FAILURES };
};
