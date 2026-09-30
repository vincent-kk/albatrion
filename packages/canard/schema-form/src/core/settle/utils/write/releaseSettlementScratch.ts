import type { SettlementScratch } from './getSettlementScratch';

/**
 * Drop call-local references before the runtime retains reusable containers.
 * @param scratch - Reserved work containers from one completed settlement
 * @returns Nothing; another synchronous write may reuse the containers
 */
export const releaseSettlementScratch = (scratch: SettlementScratch): void => {
  scratch.entered.clear();
  scratch.exited.clear();
  scratch.selectedDeclarationIds.clear();
  scratch.writtenInputs.clear();
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
