import { recordSettlementFailure } from '../errors/recordSettlementFailure';

import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { effectiveType } from '../commit/effectiveType';
import { BUDGET_EXCEEDED } from '../errors/settleErrorCode';
import { computeNode } from '../compute/computeNode';
import { markWrite } from '../write/markWrite';
import { registerRecalculation } from '../write/registerRecalculation';
import { staticSpec } from '../write/staticSpec';
import { isMissingRaw } from './isMissingRaw';
import { readDefault } from './readDefault';
import { getTransitionCap } from './getTransitionCap';
import { withdrawDetachedFills } from './withdrawDetachedFills';
import { runDeriveRounds } from '../derivation/runDeriveRounds';
import { hasWrongKindBranchAncestor } from './hasWrongKindBranchAncestor';
import { updateOutput } from '../compute/updateOutput';

/**
 * Apply appearance fills and final-list interpretation within a bounded round.
 * @param context - Calculated shape and this call's original write inputs
 * @returns Nothing; the context records automatic writes for possible rollback
 */
export const transitionSettlement = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (context.suppressAutomaticWrites || context.exceededBudget) return;
  if (!context.hasGates && context.entered.size === 0 && context.exited.size === 0) {
    let narrowed = false;
    for (const node of context.writtenInputs.keys())
      if (!node.detached && effectiveType(node) !== node.schemaType) {
        narrowed = true;
        break;
      }
    if (!narrowed) return;
  }
  context.inTransition = true;
  const cap = getTransitionCap(context.root.runtime.blueprint);
  const filled = context.hasGates ? new Set<string>() : undefined;
  const filledNodes = context.hasGates ? undefined : new Set<Self>();
  let rounds = 0;
  while (true) {
    context.automaticChanged = false;
    const enteredByDepth: Self[][] = [];
    for (const node of context.entered)
      (enteredByDepth[node.depth] ??= []).push(node);
    for (let depth = 0; depth < enteredByDepth.length; depth++) {
      const entered = enteredByDepth[depth];
      if (!entered) continue;
      for (let index = 0; index < entered.length; index++) {
        const node = entered[index];
        if (node.detached || context.pendingExits.size !== 0 &&
          context.pendingExits.has(JSON.stringify([
            node.path, node.blueprintNode.kind]))) continue;
        if (filledNodes) {
          if (filledNodes.has(node)) continue;
          filledNodes.add(node);
        } else if (filled) {
          const key = JSON.stringify([node.path, node.blueprintNode.kind]);
          if (filled.has(key)) continue;
          filled.add(key);
        }
        if (context.kind !== 'load' && hasWrongKindBranchAncestor(node)) continue;
        if (context.deriveState?.activeUnsetTargets.has(node)) continue;
        if (node.raw !== undefined) continue;
        const value = readDefault(node, context.selectedDeclarationIds);
        if (value === undefined || !isMissingRaw(node, context)) continue;
        context.filledNodes.add(node);
        context.automatic = true;
        context.writtenInputs.set(node, value);
        markWrite(node, value, context);
        context.automatic = false;
      }
    }
    for (const [node, original] of context.writtenInputs) {
      if (node.detached || context.pendingExits.size !== 0 &&
        context.pendingExits.has(JSON.stringify([
        node.path, node.blueprintNode.kind]))) continue;
      const effective = effectiveType(node);
      if (effective === node.schemaType) continue;
      context.automatic = true;
      markWrite(node, original, context, staticSpec(effective, node.nullable));
      context.automatic = false;
    }
    if (context.initialOutputs) {
      const outputs = context.initialOutputs;
      context.initialOutputs = undefined;
      for (let index = 0; index < outputs.length; index++)
        updateOutput(outputs[index], context);
      context.dirtyPaths.clear();
      context.inTransition = false;
      return;
    }
    if (!context.automaticChanged) {
      withdrawDetachedFills(context);
      context.inTransition = false;
      return;
    }
    rounds++;
    if (rounds > cap) {
      recordSettlementFailure(context, new SchemaFormError(BUDGET_EXCEEDED,
        `Transition budget exceeded at ${context.target.path}`,
        { path: context.target.path }), 'budget');
      context.exceededBudget = 'transition';
      context.iterations = cap;
      context.inTransition = false;
      return;
    }
    registerRecalculation(context);
    context.hostWheelExceeded = undefined;
    computeNode(context.root, context);
    if (context.hostWheelExceeded !== undefined && !context.exceededBudget) {
      recordSettlementFailure(context, new SchemaFormError(BUDGET_EXCEEDED,
        `Host wheel budget exceeded at ${context.target.path}`,
        { path: context.target.path }), 'budget');
      context.exceededBudget = 'hostWheel';
      context.iterations = context.hostWheelExceeded;
    }
    if (context.exceededBudget) {
      context.inTransition = false;
      return;
    }
    runDeriveRounds(context);
    if (context.exceededBudget) {
      context.inTransition = false;
      return;
    }
  }
};
