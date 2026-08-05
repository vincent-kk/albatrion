// Public programmatic API.
export { runCli } from './commands/index.js';
export {
  HASH_MANIFEST_FILENAME,
  computeNamespacePrefixes,
  isValidScope,
  readHashManifest,
  resolveScope,
  type HashManifest,
  type InjectReport,
  type Scope,
  type ScopeResolution,
} from './core/index.js';
export type { AssetType } from './utils/types.js';
