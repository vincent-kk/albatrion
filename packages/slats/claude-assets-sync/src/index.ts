// Public programmatic API.
export { runCli, type RunCliOptions } from './commands/index.js';
export {
  HASH_MANIFEST_FILENAME,
  computeNamespacePrefixes,
  injectDocs,
  isInteractive,
  isValidScope,
  readHashManifest,
  resolveScope,
  type HashManifest,
  type InjectOptions,
  type InjectReport,
  type Scope,
  type ScopeResolution,
} from './core/index.js';
export type { AssetType } from './utils/types.js';
