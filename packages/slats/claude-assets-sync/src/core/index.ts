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
  summarize,
  type InjectReport,
} from './injectDocs/index.js';
export {
  buildPlan,
  type Action,
  type InjectPlan,
  type PlanInput,
} from './buildPlan/index.js';
export {
  findNearestDotClaudeAncestor,
  isValidScope,
  resolveScope,
  type Scope,
  type ScopeResolution,
} from './scope/index.js';
