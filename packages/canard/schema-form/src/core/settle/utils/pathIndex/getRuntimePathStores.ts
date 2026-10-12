import type { SchemaNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { RuntimePathStores } from './type';

/**
 * Read explicitly typed stores, constructing absent optional stores as empty indexes.
 * @param runtime - Tree-owned path-keyed stores created by normal runtime writers
 * @returns The native indexed mutation and lookup surfaces, without adoption
 */
export const getRuntimePathStores = <Self>(
  runtime: SchemaNodeRuntime<Self>,
): RuntimePathStores<Self> => ({
  latent: runtime.latentRaw,
  metadata: runtime.latentRawMetadata ??= new PathKeyedMap('pair'),
  declarations: runtime.committedDeclarationIds ??= new PathKeyedMap('pair'),
  rules: runtime.committedRuleValues ??= new PathKeyedMap('rule'),
  mismatches: runtime.typeMismatchPaths,
  mismatchMemo: runtime.typeMismatchesMemo ??= new PathKeyedMap('path'),
  inactiveMemo: runtime.inactiveValuesMemo,
  inactiveEntries: runtime.inactiveValueEntries ??= new PathKeyedMap('pair'),
});
