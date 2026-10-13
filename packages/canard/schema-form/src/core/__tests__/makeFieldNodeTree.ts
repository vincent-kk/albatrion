import type { FormErrorReporter } from '../../errors';
import { fieldNodeFactory } from '../FieldNode';
import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../blueprint';
import { PathKeyedMap } from '../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../utils/pathIndex/PathKeyedSet';
import type { Validator } from '../validation';
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
    latentRaw: new PathKeyedMap('pair'),
    typeMismatchPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<
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
