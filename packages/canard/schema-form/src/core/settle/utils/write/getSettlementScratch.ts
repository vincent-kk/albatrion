import type { SchemaNodeRuntime, SettlementScratch } from '../../../record';
import { DirtyPathSet } from './DirtyPathSet';

/**
 * Reuse cleared work containers while preserving nested-write isolation.
 * @param runtime - One tree's root-owned settlement runtime
 * @returns Containers reserved until the caller releases them
 */
export const getSettlementScratch = <Self>(runtime: SchemaNodeRuntime<Self>): SettlementScratch<Self> => {
  const cached = runtime.settlementScratch;
  const dirtyChildrenByParent = cached && !cached.inUse
    ? cached.dirtyChildrenByParent : new Map<string, Map<string, string>>();
  const scratch: SettlementScratch<Self> = cached && !cached.inUse ? cached : {
    inUse: false,
    entered: new Set<Self>(), revived: new Set<Self>(),
    exited: new Set<Self>(), pendingExits: new Map<string, Self>(),
    perished: new Set<Self>(),
    selectedDeclarationIds: new Map<Self, readonly number[]>(),
    writtenInputs: new Map<Self, unknown>(), distributedInputs: new Map(),
    wrongKindHosts: new Set<Self>(), automaticLog: [],
    arrayStructureLog: [], arrayCounts: new Map<Self, number>(),
    pathChanges: [],
    filledNodes: new Set<Self>(),
    latentAutomaticLog: new Map<string, { present: boolean; value: unknown }>(),
    dirtyPaths: new DirtyPathSet(dirtyChildrenByParent),
    dirtyChildrenByParent,
    dependencyOwnerPaths: new Set<string>(),
    shapeDirtyPaths: new Set<string>(),
    changedRaw: new Set<string>(), explicitRaw: new Set<string>(),
    changedNodes: new Set<Self>(),
    stateDirtyNodes: new Set<Self>(),
    originalSchemas: new Map(),
  };
  if (!cached) runtime.settlementScratch = scratch;
  scratch.inUse = true;
  return scratch;
};
