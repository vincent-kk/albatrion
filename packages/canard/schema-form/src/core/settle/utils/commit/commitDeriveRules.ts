import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { NodeState } from '../../../types/state';
import { patchSchemaNodeInteractionState } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { evaluateResetInteraction } from '../../derive';
import type { SettlementContext } from '../../type';
import { getDeriveState } from '../derivation/getDeriveState';
import { SchemaFormError } from '../../../../errors';
import { EXPRESSION_THREW } from '../errors/settleErrorCode';
import { walkSchemaNodes } from '../../../navigation';
import { pruneCommittedRuleKeys } from './pruneCommittedRuleKeys';
import { updateCommittedRuleValue } from './updateCommittedRuleValue';

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
  for (const failure of decision.failures) {
    recordSettlementFailure(context, new SchemaFormError(EXPRESSION_THREW,
      `Reset interaction expression failed at ${failure.schemaPath}`,
      { path: failure.sourcePath,
        schemaPath: failure.schemaPath, cause: failure.cause }), 'expression');
  }
  for (const node of decision.nodes) {
    const previous = node.interactionState;
    patchSchemaNodeInteractionState(node, {
      [NodeState.Dirty]: false, [NodeState.Touched]: false,
    });
    if (node.interactionState !== previous) context.changedNodes.add(node);
  }
  const runtime = context.root.runtime;
  for (const path of state.visitedSourcePaths)
    pruneCommittedRuleKeys(runtime, path, 'source');
  for (const exited of context.exited)
    walkSchemaNodes(exited, (node) =>
      pruneCommittedRuleKeys(runtime, node.path, 'occurrence'));
  for (const key of state.activeRuleKeys)
    if (state.consumedRuleValues.has(key))
      updateCommittedRuleValue(runtime, key, 'set',
        state.consumedRuleValues.get(key));
};
