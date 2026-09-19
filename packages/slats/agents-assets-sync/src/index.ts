// Public programmatic API.
export { runCli } from './commands/index.js';
export {
  HASH_MANIFEST_FILENAME,
  MARKER_PREFIX,
  PROJECT_ANCHORS,
  PROJECT_ROOT_MARKERS,
  computeNamespacePrefixes,
  formatBlockId,
  isValidAgent,
  isValidScope,
  parseBlocks,
  readHashManifest,
  resolveAgentTarget,
  resolveDestinations,
  resolveProjectRoot,
  type AgentTarget,
  type AgentType,
  type AssetKind,
  type Destination,
  type HashManifest,
  type InjectReport,
  type OrphanScan,
  type ProjectRootResolution,
  type Scope,
} from './core/index.js';
export type { AssetType } from './types/index.js';
