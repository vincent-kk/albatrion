import { StaticFirstLoadCapability } from '../../../blueprint';
import type { FieldNodeRecord, SettlementScratch } from '../../../record';
import { WriteOption } from '../../../types/value';
import type { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { prepareGateSelection } from '../compute/childSelection/prepareGateSelection';
import { getVirtualReferenceIndex } from '../compute/getVirtualReferenceIndex';
import { watchSplitRegistration } from '../gates/watchSplitRegistration';
import { getTransitionCap } from '../transition/getTransitionCap';

/**
 * Bind reusable call containers to one synchronous settlement entry.
 * @param node - Live target whose root owns the runtime and scratch
 * @param kind - Input origin for load and warning behavior
 * @param option - Caller flags that may override the form default
 * @param scratch - Reserved work containers for this entry
 * @param replaces - Whether a caller write replaces its subtree
 * @returns Call-local state without preparing statically absent capabilities
 */
export const createSettlementContext = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  kind: FieldNodeWriteKind,
  option: WriteOption,
  scratch: SettlementScratch<Self>,
  replaces = false,
): SettlementContext<Self> => {
  const root = node.rootNode;
  const runtime = root.runtime;
  const blueprint = runtime.blueprint;
  const disable = (option & WriteOption.DisableAutomaticWrites) !== 0;
  const enable = (option & WriteOption.EnableAutomaticWrites) !== 0;
  const hasSplitRegistration =
    !blueprint.capabilities.branchless &&
    prepareGateSelection(blueprint, kind !== 'load');
  const context: SettlementContext<Self> = {
    root,
    previousEmit: root.emit,
    previousContext: runtime.context,
    target: node,
    kind,
    option,
    hasGates:
      !blueprint.capabilities.branchless && getTransitionCap(blueprint) > 1,
    virtualReferenceIndex: StaticFirstLoadCapability.has(blueprint)
      ? null
      : getVirtualReferenceIndex(blueprint),
    suppressAutomaticWrites:
      disable || (!enable && runtime.disableAutomaticWrites === true),
    loadScope: kind === 'load' ? node : undefined,
    replaceScope: replaces ? node : undefined,
    entered: scratch.entered,
    revived: scratch.revived,
    exited: scratch.exited,
    pendingExits: scratch.pendingExits,
    pendingExitPaths: scratch.pendingExitPaths,
    pendingExitScratch: scratch,
    perished: scratch.perished,
    selectedDeclarationIds: scratch.selectedDeclarationIds,
    writtenInputs: scratch.writtenInputs,
    distributedInputs: scratch.distributedInputs,
    wrongKindHosts: scratch.wrongKindHosts,
    automaticLog: scratch.automaticLog,
    arrayStructureLog: scratch.arrayStructureLog,
    arrayCounts: scratch.arrayCounts,
    pathChanges: scratch.pathChanges,
    filledNodes: scratch.filledNodes,
    inTransition: false,
    literalStarAutomaticLog: scratch.literalStarAutomaticLog,
    automatic: false,
    automaticChanged: false,
    dirtyPaths: scratch.dirtyPaths,
    dirtyChildrenByParent: scratch.dirtyChildrenByParent,
    dependencyOwnerPaths: scratch.dependencyOwnerPaths,
    registrationEpoch: 0,
    shapeDirtyPaths: scratch.shapeDirtyPaths,
    changedRaw: scratch.changedRaw,
    changedNodes: scratch.changedNodes,
    stateDirtyNodes: scratch.stateDirtyNodes,
    originalSchemas: scratch.originalSchemas,
  };
  if (hasSplitRegistration) watchSplitRegistration(context);
  return context;
};
