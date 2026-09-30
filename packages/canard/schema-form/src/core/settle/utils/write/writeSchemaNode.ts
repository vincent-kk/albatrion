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
import { staticSpec } from './staticSpec';
import { BUDGET_EXCEEDED } from '../errors/settleErrorCode';
import { transitionSettlement } from '../transition/transitionSettlement';
import { restoreSourceB } from '../transition/restoreSourceB';
import { pruneLatentRaw } from './pruneLatentRaw';
import { promoteHostForChildWrite } from './promoteHostForChildWrite';
import { getTransitionCap } from '../transition/getTransitionCap';
import { getSettlementScratch } from './getSettlementScratch';
import { releaseSettlementScratch } from './releaseSettlementScratch';
import { finalizeExits } from '../transition/finalizeExits';
import { getLatentOrder } from '../latent/getLatentOrder';
import { hasLivePathKind } from '../detached/hasLivePathKind';

/**
 * Settle one caller write through marking, calculation, and a single commit.
 * @param node - Live target belonging to a tree with a node factory
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
    const latentRaw = node.rootNode.runtime.latentRaw;
    const key = JSON.stringify([node.path, node.blueprintNode.kind]);
    const previous = latentRaw.get(key);
    const mergeable = kind === 'callerPartial' && isPlain(input) &&
      isPlain(previous) && node.behavior.strategy === 'branch';
    if (mergeable) pruneLatentRaw(node, Object.keys(input));
    else if (kind === 'callerReplace' || kind === 'load' ||
      kind === 'callerPartial') pruneLatentRaw(node);
    const source = mergeable ? { ...previous, ...input } : input;
    latentRaw.set(key,
      node.behavior.interpret(source, staticSpec(node.schemaType, node.nullable)));
    const metadata = node.rootNode.runtime.latentRawMetadata ?? new Map();
    node.rootNode.runtime.latentRawMetadata = metadata;
    metadata.set(key, { path: node.path, blueprintNode: node.blueprintNode,
      order: getLatentOrder(node.parent, node.name, node.blueprintNode) });
    return;
  }
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  const scratch = getSettlementScratch(node.rootNode.runtime);
  const context: SettlementContext<Self> = {
    root: node.rootNode,
    target: node,
    kind,
    hasGates: getTransitionCap(node.rootNode.runtime.blueprint) > 1,
    suppressAutomaticWrites: disable || (!enable &&
      node.rootNode.runtime.disableAutomaticWrites === true),
    loadScope: kind === 'load' ? node : undefined,
    entered: scratch.entered,
    exited: scratch.exited,
    pendingExits: scratch.pendingExits,
    selectedDeclarationIds: scratch.selectedDeclarationIds,
    writtenInputs: scratch.writtenInputs,
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
    if (kind === 'callerReplace' || kind === 'load' ||
      (kind === 'callerPartial' && (input === null || typeof input !== 'object' ||
        Array.isArray(input) || node.behavior.strategy !== 'branch')))
      pruneLatentRaw(node);
    markWrite(node, input, context);
    if (kind !== 'load' && kind !== 'automatic')
      promoteHostForChildWrite(node, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    const explicitRaw = scratch.explicitRaw;
    for (const path of context.changedRaw) explicitRaw.add(path);
    if (context.hostWheelExceeded && !context.failure) {
      context.failure = new SchemaFormError(BUDGET_EXCEEDED,
        `Host wheel budget exceeded at ${node.path}`, { path: node.path });
      context.cause = 'budget';
      context.exceededBudget = 'hostWheel';
      context.iterations = context.hostWheelExceeded;
    }
    if (!context.failure) transitionSettlement(context);
    if (context.cause === 'budget') restoreSourceB(context, explicitRaw);
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
