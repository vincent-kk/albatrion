import { isArray } from '@winglet/common-utils/filter';

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

/**
 * Apply appearance fills and final-list interpretation within a bounded round.
 * @param context - Calculated shape and this call's original write inputs
 * @returns Nothing; the context records automatic writes for possible rollback
 */
export const transitionSettlement = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (context.suppressAutomaticWrites || context.failure) return;
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
    for (const node of [...context.entered].sort((left, right) => left.depth - right.depth)) {
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
      if (context.kind !== 'load' && hasWrongKindObjectAncestor(node)) continue;
      if (context.deriveState?.activeUnsetTargets.has(node)) continue;
      if (!isMissingRaw(node, context)) continue;
      const value = readDefault(node);
      if (value === undefined) continue;
      context.filledNodes.add(node);
      context.automatic = true;
      context.writtenInputs.set(node, value);
      markWrite(node, value, context);
      context.automatic = false;
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
    if (!context.automaticChanged) {
      withdrawDetachedFills(context);
      context.inTransition = false;
      return;
    }
    rounds++;
    if (rounds > cap) {
      context.failure = new SchemaFormError(BUDGET_EXCEEDED,
        `Transition budget exceeded at ${context.target.path}`,
        { path: context.target.path });
      context.cause = 'budget';
      context.exceededBudget = 'transition';
      context.iterations = cap;
      context.inTransition = false;
      return;
    }
    registerRecalculation(context);
    context.hostWheelExceeded = undefined;
    computeNode(context.root, context);
    if (context.hostWheelExceeded !== undefined && !context.failure) {
      context.failure = new SchemaFormError(BUDGET_EXCEEDED,
        `Host wheel budget exceeded at ${context.target.path}`,
        { path: context.target.path });
      context.cause = 'budget';
      context.exceededBudget = 'hostWheel';
      context.iterations = context.hostWheelExceeded;
    }
    if (context.failure) {
      context.inTransition = false;
      return;
    }
    runDeriveRounds(context);
    if (context.failure) {
      context.inTransition = false;
      return;
    }
  }
};

/** Non-load writes do not fill children hidden beneath a wrong-kind object host. */
const hasWrongKindObjectAncestor = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): boolean => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === 'object' && parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined && (parent.raw === null ||
        typeof parent.raw !== 'object' || isArray(parent.raw))) return true;
    parent = parent.parent;
  }
  return false;
};
