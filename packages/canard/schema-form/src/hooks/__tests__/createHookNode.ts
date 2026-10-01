import { PathKeyedMap } from '../../core/utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../core/utils/pathIndex/PathKeyedSet';
import { blueprint } from '@/schema-form/core/blueprint';
import { schemaNodeFactory } from '@/schema-form/core/SchemaNode';

/** Create a real new-engine node through its module entry points. */
export const createHookNode = () => schemaNodeFactory(blueprint({ type: 'string' }), {
  diagnostics: { status: 'stable' },
  loadSnapshot: undefined,
  latentRaw: new PathKeyedMap('pair'),
  typeMismatchPaths: new PathKeyedSet(),
  inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
});
