import { NodeState } from '../../../types/state';
import { patchSchemaNodeInteractionState } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { evaluateResetInteraction } from '../../derive';
import type { SettlementContext } from '../../type';
import { getDeriveState } from '../derivation/getDeriveState';
import { SchemaFormError } from '../../../../errors';
import { EXPRESSION_THREW } from '../errors/settleErrorCode';
import { isArray } from '@winglet/common-utils/filter';

/**
 * Publish final rule baselines and clear interaction flags before revision bumps.
 * @param context - Final calculated shape and call-local consumed edge values
 * @returns Nothing; changed records and runtime baselines are updated
 */
export const commitDeriveRules = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state) return;
  const decision = evaluateResetInteraction(context.root, state);
  if (state.trace && decision.trace.length)
    (context.traceRounds ??= []).push([...decision.trace]);
  if (decision.failure && !context.failure) {
    context.failure = new SchemaFormError(EXPRESSION_THREW,
      `Reset interaction expression failed at ${decision.failure.schemaPath}`,
      { path: decision.failure.sourcePath,
        schemaPath: decision.failure.schemaPath, cause: decision.failure.cause });
    context.cause = 'expression';
  }
  for (const node of decision.nodes) {
    const previous = node.state;
    patchSchemaNodeInteractionState(node, {
      [NodeState.Dirty]: false, [NodeState.Touched]: false,
    });
    if (node.state !== previous) context.changedNodes.add(node);
  }
  const next = new Map(state.committedRuleValues);
  const replacedPaths = new Set(state.visitedSourcePaths);
  for (const node of context.exited) replacedPaths.add(node.path);
  for (const key of next.keys()) {
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[0] === 'string' &&
      replacedPaths.has(parts[0])) next.delete(key);
  }
  for (const key of state.activeRuleKeys)
    if (state.consumedRuleValues.has(key))
      next.set(key, state.consumedRuleValues.get(key));
  context.root.runtime.committedRuleValues = next;
};
