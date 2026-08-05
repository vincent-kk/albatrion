export {
  hashContent,
  hashEquals,
  hashFile,
  type Sha256Hex,
} from './hash/index.js';
export {
  HASH_MANIFEST_FILENAME,
  computeNamespacePrefixes,
  readHashManifest,
  type HashManifest,
} from './hashManifest/index.js';
export {
  applyAction,
  applyBlockActions,
  partitionActions,
  summarize,
  type InjectReport,
} from './injectDocs/index.js';
export {
  buildPlan,
  type Action,
  type ActionKind,
  type ActionTarget,
  type InjectPlan,
  type PlanInput,
} from './buildPlan/index.js';
export {
  isValidAgent,
  resolveAgentTarget,
  resolveDestinations,
  splitAssetKind,
  type AgentTarget,
  type AgentType,
  type AssetKind,
  type Destination,
  type OrphanScan,
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
  findNearestAnchorAncestor,
  isValidScope,
  resolveProjectRoot,
  type ProjectRootResolution,
  type Scope,
} from './scope/index.js';
