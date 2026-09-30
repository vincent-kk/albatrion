import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import { SetValueOption } from '../../../types/value';
import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeWriteKind, SettlementContext } from '../../type';
import { commitSettlement } from '../commit/commitSettlement';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { markWrite } from './markWrite';
import { isPlain } from './isPlain';
import { registerRecalculation } from './registerRecalculation';
import { BUDGET_EXCEEDED } from '../errors/settleErrorCode';
import { transitionSettlement } from '../transition/transitionSettlement';
import { restoreSourceB } from '../transition/restoreSourceB';
import { pruneLatentRaw } from './pruneLatentRaw';
import { markWrongKindAncestors } from './markWrongKindAncestors';
import { releaseWrongKindHosts } from './releaseWrongKindHosts';
import { getTransitionCap } from '../transition/getTransitionCap';
import { getSettlementScratch } from './getSettlementScratch';
import { releaseSettlementScratch } from './releaseSettlementScratch';
import { finalizeExits } from '../transition/finalizeExits';
import { getLatentOrder } from '../latent/getLatentOrder';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { runDeriveRounds } from '../derivation/runDeriveRounds';
import { captureDeriveBaseline } from '../derivation/captureDeriveBaseline';

/**
 * Apply a live write or an own-kind detached latent write (26C-14).
 * @param node - Live target or detached reference in a tree with a node factory
 * @param input - Caller-owned value interpreted first under static types
 * @param kind - Input origin retained for warning and transition semantics
 * @param option - Caller flags whose automatic-write bits override the form default
 * @returns Nothing; live records carry the committed shape and values
 * @throws A deferred gate or shared declaration failure after commit
 */
export const writeSchemaNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: SchemaNodeWriteKind,
  option: SetValueOption,
): void => {
  if (node.detached) {
    if (hasLivePathKind(node)) return;
    const whole = kind !== 'callerPartial' || !isPlain(input) ||
      node.behavior.strategy !== 'branch';
    if (whole) pruneLatentRaw(node.rootNode.runtime, node.path);
    distributeLatentValue(node.rootNode.runtime, undefined, node.path,
      node.blueprintNode, input,
      getLatentOrder(node.parent, node.name, node.blueprintNode),
      whole, node.parent?.blueprintNode.childEntries ?? []);
    return;
  }
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  const scratch = getSettlementScratch(node.rootNode.runtime);
  const replaces = kind === 'callerReplace' ||
    kind === 'input' && node.behavior.strategy === 'branch' ||
    (kind === 'callerPartial' && (input === null || typeof input !== 'object' ||
      isArray(input) || node.behavior.strategy !== 'branch'));
  const context: SettlementContext<Self> = {
    root: node.rootNode,
    target: node,
    kind,
    option,
    hasGates: getTransitionCap(node.rootNode.runtime.blueprint) > 1,
    suppressAutomaticWrites: disable || (!enable &&
      node.rootNode.runtime.disableAutomaticWrites === true),
    loadScope: kind === 'load' ? node : undefined,
    replaceScope: replaces ? node : undefined,
    entered: scratch.entered,
    revived: scratch.revived,
    exited: scratch.exited,
    pendingExits: scratch.pendingExits,
    selectedDeclarationIds: scratch.selectedDeclarationIds,
    writtenInputs: scratch.writtenInputs,
    distributedInputs: scratch.distributedInputs,
    wrongKindHosts: scratch.wrongKindHosts,
    automaticLog: scratch.automaticLog,
    filledNodes: scratch.filledNodes,
    inTransition: false,
    latentAutomaticLog: scratch.latentAutomaticLog,
    automatic: false,
    automaticChanged: false,
    dirtyPaths: scratch.dirtyPaths,
    shapeDirtyPaths: scratch.shapeDirtyPaths,
    changedRaw: scratch.changedRaw,
    changedNodes: scratch.changedNodes,
    originalSchemas: scratch.originalSchemas,
  };
  try {
    if (context.hasGates) getGateRegistry(context.root.runtime).register(context.root);
    if (replaces || kind === 'load')
      pruneLatentRaw(node.runtime, node.path, undefined, context);
    markWrite(node, input, context);
    if (kind !== 'load' && kind !== 'automatic')
      markWrongKindAncestors(node, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    releaseWrongKindHosts(context);
    const explicitRaw = scratch.explicitRaw;
    for (const path of context.changedRaw) explicitRaw.add(path);
    if (context.hostWheelExceeded && !context.failure) {
      context.failure = new SchemaFormError(BUDGET_EXCEEDED,
        `Host wheel budget exceeded at ${node.path}`, { path: node.path });
      context.cause = 'budget';
      context.exceededBudget = 'hostWheel';
      context.iterations = context.hostWheelExceeded;
    }
    if (!context.failure) runDeriveRounds(context);
    if (!context.failure) transitionSettlement(context);
    if (context.cause === 'budget') {
      restoreSourceB(context, explicitRaw);
      captureDeriveBaseline(context);
    }
    finalizeExits(context);
    if (kind === 'load')
      for (const path of node.runtime.typeMismatchPaths)
        if (!node.path || path === node.path || path.startsWith(`${node.path}/`))
          node.runtime.typeMismatchPaths.delete(path);
    commitSettlement(context);
    if (context.failure) throw context.failure;
  } finally {
    releaseSettlementScratch(scratch);
  }
};
