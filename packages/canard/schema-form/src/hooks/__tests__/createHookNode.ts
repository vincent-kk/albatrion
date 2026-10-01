import { blueprint } from '@/schema-form/core/blueprint';
import { schemaNodeFactory } from '@/schema-form/core/SchemaNode';

/** Create a real new-engine node through its module entry points. */
export const createHookNode = () => schemaNodeFactory(blueprint({ type: 'string' }), {
  diagnostics: { status: 'stable' },
  loadSnapshot: undefined,
  latentRaw: new Map(),
  typeMismatchPaths: new Set(),
  inactiveValuesMemo: new Map(),
});
