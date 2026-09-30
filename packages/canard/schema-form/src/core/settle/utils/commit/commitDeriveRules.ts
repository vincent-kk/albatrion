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
  const exitedPaths = new Set([...context.exited].map((node) => node.path));
  for (const key of next.keys()) {
    const parts: unknown = JSON.parse(key);
    if (!isArray(parts) || typeof parts[0] !== 'string') continue;
    const sourcePath = parts[0];
    if (state.visitedSourcePaths.has(sourcePath) ||
      isExitedPath(sourcePath, exitedPaths) ||
      typeof parts[5] === 'string' && isExitedPath(parts[5], exitedPaths))
      next.delete(key);
  }
  for (const key of state.activeRuleKeys)
    if (state.consumedRuleValues.has(key))
      next.set(key, state.consumedRuleValues.get(key));
  context.root.runtime.committedRuleValues = next;
};

/**
 * Match an exited subtree root without confusing adjacent pointer segments.
 * @param path - Absolute source or target occurrence path
 * @param exitedPaths - Final departed subtree roots
 * @returns Whether the occurrence is inside an exited subtree
 */
const isExitedPath = (path: string, exitedPaths: ReadonlySet<string>): boolean => {
  let ancestor = path;
  while (true) {
    if (exitedPaths.has(ancestor)) return true;
    if (!ancestor) return false;
    ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
  }
};
