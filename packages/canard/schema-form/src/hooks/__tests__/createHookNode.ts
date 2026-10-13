import { fieldNodeFactory } from '@/schema-form/core/FieldNode';
import { blueprint } from '@/schema-form/core/blueprint';

/** Create a real new-engine node through its module entry points. */
export const createHookNode = () =>
  fieldNodeFactory(blueprint({ type: 'string' }), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
  });
