import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { schemaNodeFactory } from '../../../SchemaNode';

/** Test view of the record created by the public tree factory. */
export interface DispatchTestNode extends SchemaNodeRecord<DispatchTestNode> {}

/** Check the runtime shape without a type assertion. */
const isDispatchTestNode = (value: unknown): value is DispatchTestNode =>
  value !== null && typeof value === 'object' &&
  'runtime' in value && 'rootNode' in value && 'structure' in value;

/**
 * Build a real tree with no conditional gates for dispatcher tests.
 * @param schema - Authored schema without an if gate
 * @param snapshot - Optional source retained for reset tests
 * @returns Root record and its per-tree runtime
 */
export const createDispatchTree = (schema: BlueprintSchema,
  snapshot?: unknown) => {
  const created: unknown = schemaNodeFactory(blueprint(schema), {
    ifPredicates: new Map(), diagnostics: { status: 'stable' },
    loadSnapshot: snapshot, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  });
  if (!isDispatchTestNode(created)) throw new Error('Tree factory omitted its record');
  const root = created;
  return { root, runtime: root.runtime };
};
