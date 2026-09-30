import type { SettlementScratch } from '../../../record';

/**
 * Drop call-local references before the runtime retains reusable containers.
 * @param scratch - Reserved work containers from one completed settlement
 * @returns Nothing; another synchronous write may reuse the containers
 */
export const releaseSettlementScratch = <Self>(scratch: SettlementScratch<Self>): void => {
  scratch.entered.clear();
  scratch.revived.clear();
  scratch.exited.clear();
  scratch.pendingExits.clear();
  scratch.selectedDeclarationIds.clear();
  scratch.writtenInputs.clear();
  scratch.distributedInputs.clear();
  scratch.wrongKindHosts.clear();
  scratch.automaticLog.length = 0;
  scratch.filledNodes.clear();
  scratch.latentAutomaticLog.clear();
  scratch.dirtyPaths.clear();
  scratch.shapeDirtyPaths.clear();
  scratch.changedRaw.clear();
  scratch.explicitRaw.clear();
  scratch.changedNodes.clear();
  scratch.originalSchemas.clear();
  scratch.inUse = false;
};
