import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import { evaluateResetInteraction } from '../../../derive';
import { captureFieldNodeChange, shallowPatch } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeState } from '../../../types/state';
import type { SettlementContext } from '../../type';
import { getDeriveState } from '../derivation/getDeriveState';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { walkOwnedFieldNodes } from '../walkOwnedFieldNodes';
import { pruneCommittedRuleKeys } from './pruneCommittedRuleKeys';
import { updateCommittedRuleValue } from './updateCommittedRuleValue';

/** State patch that clears the dirty and touched flags of a reset occurrence. */
const CLEAN_STATE_PATCH = {
  [FieldNodeState.Dirty]: false,
  [FieldNodeState.Touched]: false,
};

/**
 * Publish final rule baselines and clear interaction flags before revision bumps.
 * @param context - Final calculated shape and call-local consumed edge values
 * @returns Nothing; changed records and runtime baselines are updated
 */
export const commitDeriveRules = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const state = getDeriveState(context);
  if (!state) return;
  const decision = evaluateResetInteraction(context.root, state);
  if (state.trace && decision.trace.length)
    (context.traceRounds ??= []).push([...decision.trace]);
  for (const failure of decision.failures) {
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.ExpressionThrew,
        `Reset interaction expression failed at ${failure.schemaPath}`,
        {
          path: failure.sourcePath,
          schemaPath: failure.schemaPath,
          cause: failure.cause,
        },
      ),
      'expression',
    );
  }
  for (const node of decision.nodes) {
    node.interactionReset += 1;
    const previous = node.interactionState;
    node.interactionState = captureFieldNodeChange(
      node,
      'interactionState',
      shallowPatch(node.interactionState, CLEAN_STATE_PATCH),
    );
    if (node.interactionState !== previous) context.changedNodes.add(node);
  }
  const runtime = context.root.runtime;
  for (const path of state.visitedSourcePaths)
    pruneCommittedRuleKeys(runtime, path, 'source');
  for (const exited of context.exited)
    walkOwnedFieldNodes(exited, (node) =>
      pruneCommittedRuleKeys(runtime, node.path, 'occurrence'),
    );
  for (const key of state.activeRuleKeys)
    if (state.consumedRuleValues.has(key))
      updateCommittedRuleValue(
        runtime,
        key,
        'set',
        state.consumedRuleValues.get(key),
      );
};
