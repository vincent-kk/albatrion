import { PathKeyedMap } from '../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../utils/pathIndex/PathKeyedSet';
import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../blueprint';
import { schemaNodeFactory } from '../SchemaNode';
import type { Validator } from '../validation';
import type { FormErrorReporter } from '../../errors';
import { createTestValidator } from './fixtures/createTestValidator';

/** Compile authored declarations and expose only the PR-2 node surface to tests. */
export const makeSchemaNodeTree = (
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
    latentRaw: new PathKeyedMap('pair'),
    typeMismatchPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
  };
  const validator = 'validator' in options ? options.validator : createTestValidator();
  const root = schemaNodeFactory(analysis, runtime, validator);
  const treeRuntime: unknown = Reflect.get(root, 'runtime');
  if (treeRuntime === null || typeof treeRuntime !== 'object')
    throw new Error('SchemaNode tree runtime is missing');
  return { root, runtime: treeRuntime };
};
