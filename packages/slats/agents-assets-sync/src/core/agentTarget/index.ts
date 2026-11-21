export { isValidAgent, resolveAgentTarget } from './agentTarget.js';
export type {
  AgentTarget,
  AgentType,
  AssetKind,
  Destination,
  OrphanScan,
  ResolvedLocations,
} from './type.js';
export { assertDestinationRootsContained } from './utils/assertDestinationRootsContained.js';
export { assertWriteTargetsContained } from './utils/assertWriteTargetsContained.js';
export { resolveDestinations } from './utils/resolveDestinations.js';
export { splitAssetKind } from './utils/splitAssetKind.js';
