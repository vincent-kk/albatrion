import { schemaNodeFactory } from '@/schema-form/core/SchemaNode';
import { blueprint } from '@/schema-form/core/blueprint';

/** Create a real new-engine node through its module entry points. */
export const createHookNode = () =>
  schemaNodeFactory(blueprint({ type: 'string' }), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
  });
