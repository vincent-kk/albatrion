export {
  hashContent,
  hashEquals,
  hashFile,
  type Sha256Hex,
} from './hash/index.js';
export {
  HASH_MANIFEST_FILENAME,
  computeNamespacePrefixes,
  needsBuiltManifest,
  readHashManifest,
  resolveHashManifest,
  type HashManifest,
  type HashManifestSource,
} from './hashManifest/index.js';
export {
  executeUnits,
  runInjection,
  validateFlags,
  type RunUnit,
  type RunResult,
  type RunFailure,
  applyAction,
  applyBlockActions,
  partitionActions,
  summarize,
  type InjectReport,
} from './injectDocs/index.js';
export {
  buildPlan,
  collectFileWrites,
  type Action,
  type ActionKind,
  type ActionTarget,
  type InjectPlan,
  type PlanInput,
} from './buildPlan/index.js';
export {
  isValidAgent,
  resolveAgentTarget,
  resolvePublicDestinations as resolveDestinations,
  splitAssetKind,
  type AgentTarget,
  type AgentType,
  type AssetKind,
  type Destination,
  type OrphanScan,
  type ResolvedLocations,
} from './agentTarget/index.js';
export {
  MARKER_PREFIX,
  blockBodyMatches,
  findBlockBody,
  formatBlockId,
  parseBlocks,
  removeBlock,
  upsertBlock,
  type ParsedBlock,
} from './markerBlock/index.js';
export {
  PROJECT_ANCHORS,
  PROJECT_ROOT_MARKERS,
  findMarkerRoot,
  findNearestOwner,
  findProjectRoot,
  isValidScope,
  resolveProjectRoot,
  type ProjectRootResolution,
  type Scope,
} from './scope/index.js';
