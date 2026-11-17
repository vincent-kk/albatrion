import type { SettlementScratch } from '../../../record';
import { DirtyPathSet } from './DirtyPathSet';

/**
 * Drop populated call-local references and reset dirty traversal before reuse.
 * @param scratch - Reserved work containers from one completed settlement
 * @returns Nothing; another synchronous write may reuse the containers
 */
export const releaseSettlementScratch = <Self>(
  scratch: SettlementScratch<Self>,
): void => {
  if (scratch.dirtyPaths instanceof DirtyPathSet)
    scratch.dirtyPaths.restoreRegistrationObserver?.();
  if (scratch.enteredNodes.size) scratch.enteredNodes.clear();
  if (scratch.revivedNodes.size) scratch.revivedNodes.clear();
  if (scratch.exitedNodes.size) scratch.exitedNodes.clear();
  if (scratch.pendingExits.size) scratch.pendingExits.clear();
  if (scratch.pendingExitPaths?.size) scratch.pendingExitPaths.clear();
  if (scratch.perishedNodes.size) scratch.perishedNodes.clear();
  if (scratch.selectedDeclarationIds.size)
    scratch.selectedDeclarationIds.clear();
  if (scratch.writtenInputs.size) scratch.writtenInputs.clear();
  if (scratch.distributedInputs.size) scratch.distributedInputs.clear();
  if (scratch.wrongKindHosts.size) scratch.wrongKindHosts.clear();
  if (scratch.automaticLog.length) scratch.automaticLog.length = 0;
  if (scratch.arrayStructureLog.length) scratch.arrayStructureLog.length = 0;
  if (scratch.arrayCounts.size) scratch.arrayCounts.clear();
  if (scratch.pathChanges.length) scratch.pathChanges.length = 0;
  if (scratch.filledNodes.size) scratch.filledNodes.clear();
  scratch.dirtyPaths.clear();
  if (scratch.dependencyOwnerPaths.size) scratch.dependencyOwnerPaths.clear();
  if (scratch.shapeDirtyPaths.size) scratch.shapeDirtyPaths.clear();
  if (scratch.changedSource.size) scratch.changedSource.clear();
  if (scratch.explicitSource.size) scratch.explicitSource.clear();
  if (scratch.changedNodes.size) scratch.changedNodes.clear();
  if (scratch.stateDirtyNodes.size) scratch.stateDirtyNodes.clear();
  if (scratch.originalSchemas.size) scratch.originalSchemas.clear();
  scratch.isInUse = false;
};
