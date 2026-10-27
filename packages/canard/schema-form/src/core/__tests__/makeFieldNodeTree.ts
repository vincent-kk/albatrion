import { blueprint } from '@/schema-form/core/engine';
import type { BlueprintSchema } from '@/schema-form/core/engine';
import { PathKeyedMap } from '@/schema-form/core/engine';
import { PathKeyedSet } from '@/schema-form/core/engine';
import type { Validator } from '@/schema-form/core/engine';
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
    literalStarRaw: new PathKeyedMap('pair'),
    misfitPaths: new PathKeyedSet(),
    literalStarValuesMemo: new PathKeyedMap<
      readonly { path: string; value: unknown }[]
    >('path'),
  };
  const validator =
    'validator' in options ? options.validator : createTestValidator();
  const root = fieldNodeFactory(analysis, runtime, validator);
  const treeRuntime: unknown = Reflect.get(root, 'runtime');
  if (treeRuntime === null || typeof treeRuntime !== 'object')
    throw new Error('FieldNode tree runtime is missing');
  return { root, runtime: treeRuntime };
};
