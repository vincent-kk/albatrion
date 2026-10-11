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
import { collectFillDescendants } from './collectFillDescendants';
import { hasRecursiveFill } from './hasRecursiveFill';
import { RECURSIVE_SHAPE_DIVERGED } from '../errors/settleErrorCode';

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
  let fillHosts: Set<Self> | undefined;
  let fillAncestors: Map<Self, number> | undefined;
  let newArrayHosts: Set<Self> | undefined;
  let descendantsByDepth: Self[][] | undefined;
  let appearances: Iterator<Self>;
  let appearanceCount = 0;
  let rounds = 0;
  while (true) {
    context.automaticChanged = false;
    newArrayHosts?.clear();
    const continuingFill = descendantsByDepth !== undefined;
    const enteredByDepth: Self[][] = descendantsByDepth ?? [];
    descendantsByDepth = undefined;
    if (!continuingFill) {
      appearances = context.entered.values();
      appearanceCount = context.entered.size;
      for (let index = 0; index < appearanceCount; index++) {
        const node = appearances.next().value!;
        (enteredByDepth[node.depth] ??= []).push(node);
      }
    }
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
        if (node.behavior.type === 'array' &&
          context.distributedInputs.get(node)?.input !== undefined) continue;
        const value = readDefault(node, context.selectedDeclarationIds);
        if (value === undefined || !isMissingRaw(node, context)) continue;
        if (node.behavior.strategy === 'branch') {
          if (fillHosts && hasRecursiveFill(node, fillHosts, context)) {
            recordSettlementFailure(context, new SchemaFormError(RECURSIVE_SHAPE_DIVERGED,
              `Recursive shape diverged at ${node.path}`, { path: node.path }), 'budget');
            context.exceededBudget = 'recursion';
            context.inTransition = false;
            return;
          }
          (fillHosts ??= new Set()).add(node);
          fillAncestors ??= new Map();
          if (!fillAncestors.has(node) || fillAncestors.get(node) === -1)
            fillAncestors.set(node, node.itemCount);
        }
        context.filledNodes.add(node);
        context.automatic = true;
        context.writtenInputs.set(node, value);
        // markWrite logs array structure only for branch hosts and array nodes.
        const logsStructure = node.behavior.strategy === 'branch' || node.behavior.type === 'array';
        const arrayLogStart = logsStructure ? context.arrayStructureLog.length : 0;
        markWrite(node, value, context);
        context.automatic = false;
        if (logsStructure) for (let logIndex = arrayLogStart; logIndex < context.arrayStructureLog.length; logIndex++) {
          const entry = context.arrayStructureLog[logIndex];
          if (fillAncestors && (!fillAncestors.has(entry.host) ||
            fillAncestors.get(entry.host) === -1))
            fillAncestors.set(entry.host, entry.previousItemCount);
          if (context.hasGates && entry.host.itemCount > entry.previousItemCount)
            (newArrayHosts ??= new Set()).add(entry.host);
        }
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
      if (continuingFill && context.hasGates) continue;
      withdrawDetachedFills(context);
      context.inTransition = false;
      return;
    }
    if (!continuingFill) rounds++;
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
    if (context.root.runtime.blueprint.capabilities.hasDerive)
      runDeriveRounds(context);
    if (context.exceededBudget) {
      context.inTransition = false;
      return;
    }
    if (fillAncestors && context.entered.size > appearanceCount) {
      const count = context.entered.size;
      descendantsByDepth = collectFillDescendants(context, appearances!,
        count - appearanceCount, fillAncestors, newArrayHosts);
      appearanceCount = count;
    }
  }
};
