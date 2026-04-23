// Public programmatic API.
export { program, type ProgramOptions } from './program.js';
export { injectDocs, type InjectOptions, type InjectReport } from './core/inject.js';
export {
  readHashManifest,
  computeNamespacePrefixes,
  HASH_MANIFEST_FILENAME,
  type HashManifest,
} from './core/hashManifest.js';
export { resolveScope, isInteractive, isValidScope, type Scope, type ScopeResolution } from './core/scope.js';
export type { ClaudeConfig, PackageInfo, AssetType } from './utils/types.js';
