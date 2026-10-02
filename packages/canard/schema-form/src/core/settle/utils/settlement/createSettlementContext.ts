import type { SchemaNodeRecord, SettlementScratch } from '../../../record';
import { SetValueOption } from '../../../types/value';
import type { SchemaNodeWriteKind, SettlementContext } from '../../type';
import { getTransitionCap } from '../transition/getTransitionCap';
import { getVirtualReferenceIndex } from '../compute/getVirtualReferenceIndex';

/**
 * Bind reusable call containers to one synchronous settlement entry.
 * @param node - Live target whose root owns the runtime and scratch
 * @param kind - Input origin for load and warning behavior
 * @param option - Caller flags that may override the form default
 * @param scratch - Reserved work containers for this entry
 * @param replaces - Whether a caller write replaces its subtree
 * @returns The call-local settlement state
 */
export const createSettlementContext = <Self extends SchemaNodeRecord<Self>>(
  node: Self, kind: SchemaNodeWriteKind, option: SetValueOption,
  scratch: SettlementScratch<Self>, replaces = false,
): SettlementContext<Self> => {
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  return {
    root: node.rootNode,
    previousEmit: node.rootNode.emit,
    previousContext: node.rootNode.runtime.context,
    target: node,
    kind,
    option,
    hasGates: getTransitionCap(node.rootNode.runtime.blueprint) > 1,
    virtualReferenceIndex: getVirtualReferenceIndex(node.rootNode.runtime.blueprint),
    suppressAutomaticWrites: disable || (!enable &&
      node.rootNode.runtime.disableAutomaticWrites === true),
    loadScope: kind === 'load' ? node : undefined,
    replaceScope: replaces ? node : undefined,
    entered: scratch.entered,
    revived: scratch.revived,
    exited: scratch.exited,
    pendingExits: scratch.pendingExits,
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
    latentAutomaticLog: scratch.latentAutomaticLog,
    automatic: false,
    automaticChanged: false,
    dirtyPaths: scratch.dirtyPaths,
    dirtyChildrenByParent: scratch.dirtyChildrenByParent,
    dependencyOwnerPaths: scratch.dependencyOwnerPaths,
    shapeDirtyPaths: scratch.shapeDirtyPaths,
    changedRaw: scratch.changedRaw,
    changedNodes: scratch.changedNodes,
    stateDirtyNodes: scratch.stateDirtyNodes,
    originalSchemas: scratch.originalSchemas,
  };
};
