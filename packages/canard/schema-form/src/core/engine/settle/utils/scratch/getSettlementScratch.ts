import type { FieldNodeRuntime, SettlementScratch } from '../../../record';
import { DirtyPathSet } from './DirtyPathSet';

/**
 * Reuse cleared work containers while preserving nested-write isolation.
 * @param runtime - One tree's root-owned settlement runtime
 * @returns Containers reserved until the caller releases them
 */
export const getSettlementScratch = <Self>(
  runtime: FieldNodeRuntime<Self>,
): SettlementScratch<Self> => {
  const settlementScratch = runtime.settlementScratch;
  const dirtyChildrenByParent =
    settlementScratch && !settlementScratch.isInUse
      ? settlementScratch.dirtyChildrenByParent
      : new Map<string, Map<string, string>>();
  const scratch: SettlementScratch<Self> =
    settlementScratch && !settlementScratch.isInUse
      ? settlementScratch
      : {
          isInUse: false,
          enteredNodes: new Set<Self>(),
          revivedNodes: new Set<Self>(),
          exitedNodes: new Set<Self>(),
          pendingExits: new Map<string, Self>(),
          perishedNodes: new Set<Self>(),
          selectedDeclarationIds: new Map<Self, readonly number[]>(),
          writtenInputs: new Map<Self, unknown>(),
          distributedInputs: new Map(),
          wrongKindHosts: new Set<Self>(),
          arrayCounts: new Map<Self, number>(),
          pathChanges: [],
          filledNodes: new Set<Self>(),
          dirtyPaths: new DirtyPathSet(dirtyChildrenByParent),
          dirtyChildrenByParent,
          dependencyOwnerPaths: new Set<string>(),
          shapeDirtyPaths: new Set<string>(),
          changedSource: new Set<string>(),
          explicitSource: new Set<string>(),
          changedNodes: new Set<Self>(),
          stateDirtyNodes: new Set<Self>(),
          originalSchemas: new Map(),
        };
  if (!settlementScratch) runtime.settlementScratch = scratch;
  scratch.isInUse = true;
  return scratch;
};
