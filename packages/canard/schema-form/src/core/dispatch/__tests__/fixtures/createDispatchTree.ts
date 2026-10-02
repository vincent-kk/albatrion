import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../../utils/pathIndex/PathKeyedSet';
import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { schemaNodeFactory } from '../../../SchemaNode';
import type { Validator } from '../../../validation';
import type { FormErrorReporter } from '../../../../errors';

/** Test view of the record created by the public tree factory. */
export interface DispatchTestNode extends SchemaNodeRecord<DispatchTestNode> {}

/** Check the runtime shape without a type assertion. */
const isDispatchTestNode = (value: unknown): value is DispatchTestNode =>
  value !== null && typeof value === 'object' &&
  'runtime' in value && 'rootNode' in value && 'structure' in value;

/**
 * Build a real tree for dispatcher tests.
 * @param schema - Authored schema to analyze
 * @param snapshot - Optional source retained for reset tests
 * @param validator - Selected validator for conditional schemas
 * @param errorReporter - Observer for structured guard records
 * @returns Root record and its per-tree runtime
 */
export const createDispatchTree = (schema: BlueprintSchema,
  snapshot?: unknown, validator?: Validator,
  errorReporter?: FormErrorReporter) => {
  const created: unknown = schemaNodeFactory(blueprint(schema), {
    errorReporter,
    diagnostics: { status: 'stable' },
    loadSnapshot: snapshot, latentRaw: new PathKeyedMap('pair'),
    typeMismatchPaths: new PathKeyedSet(), inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
  }, validator);
  if (!isDispatchTestNode(created)) throw new Error('Tree factory omitted its record');
  const root = created;
  return { root, runtime: root.runtime };
};
