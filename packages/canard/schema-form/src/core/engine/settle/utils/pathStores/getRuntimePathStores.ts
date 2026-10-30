import type { FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { RuntimePathStores } from '../../types/pathStores';

/**
 * Read explicitly typed stores, constructing absent optional stores as empty indexes.
 * @param runtime - Tree-owned path-keyed stores created by normal runtime writers
 * @returns The native indexed mutation and lookup surfaces, without adoption
 */
export const getRuntimePathStores = <Self>(
  runtime: FieldNodeRuntime<Self>,
): RuntimePathStores<Self> => ({
  declarations: (runtime.committedDeclarationIds ??= new PathKeyedMap('pair')),
  rules: (runtime.committedRuleValues ??= new PathKeyedMap('rule')),
  misfits: runtime.misfitPaths,
  misfitsMemo: (runtime.misfitsMemo ??= new PathKeyedMap('path')),
});
