import { fieldNodeFactory } from '@/schema-form/core';
import { blueprint } from '@/schema-form/core';

/** Create a real new-engine node through its module entry points. */
export const createHookNode = () =>
  fieldNodeFactory(blueprint({ type: 'string' }), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
  });
