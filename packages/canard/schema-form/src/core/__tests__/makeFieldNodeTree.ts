import type { BlueprintSchema, Validator } from '@/schema-form/core/engine';
import { PathKeyedSet, blueprint } from '@/schema-form/core/engine';
import { fieldNodeFactory } from '@/schema-form/core/surface';
import type { FormErrorReporter } from '@/schema-form/errors';

import { createTestValidator } from './fixtures/createTestValidator';

/** Compile authored declarations and expose only the PR-2 node surface to tests. */
export const makeFieldNodeTree = (
  schema: BlueprintSchema,
  options: {
    snapshot?: unknown;
    validator?: Validator;
    errorReporter?: FormErrorReporter;
  } = {},
) => {
  const analysis = blueprint(schema);
  const runtime = {
    deliveries: new Set(),
    errorReporter: options.errorReporter,
    diagnostics: { status: 'stable' as const },
    loadSnapshot: options.snapshot,

    misfitPaths: new PathKeyedSet(),
  };
  const validator =
    'validator' in options ? options.validator : createTestValidator();
  const root = fieldNodeFactory(analysis, runtime, validator);
  const treeRuntime: unknown = Reflect.get(root, 'runtime');
  if (treeRuntime === null || typeof treeRuntime !== 'object')
    throw new Error('FieldNode tree runtime is missing');
  return { root, runtime: treeRuntime };
};
