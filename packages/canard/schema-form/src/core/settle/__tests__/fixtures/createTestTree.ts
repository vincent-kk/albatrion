import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../../utils/pathIndex/PathKeyedSet';
import { blueprint } from '../../../blueprint';
import type { Blueprint, BlueprintSchema } from '../../../blueprint';
import type { SchemaNodeRuntime } from '../../../record';
import type { Validator } from '../../../validation';
import { createTestValidator } from '../../../__tests__/fixtures/createTestValidator';
import { createPlainNode } from './createPlainNode';
import type { PlainNode } from './createPlainNode';

/**
 * Compose one analyzed schema and a plain-record factory for settlement tests.
 * @param schema - Authored root to analyze with the real blueprint compiler
 * @param validator - Selected validator using the core contract.
 * @returns Root, analysis, and visit log shared by all created records
 */
export const createTestTree = (
  schema: BlueprintSchema,
  validator: Validator = createTestValidator(),
): { root: PlainNode; blueprint: Blueprint; visits: string[] } => {
  const analysis = blueprint(schema);
  const visits: string[] = [];
  const runtime: SchemaNodeRuntime<PlainNode> = {
    deliveries: new Map(),
    blueprint: analysis,
    context: {},
    validator,
    diagnostics: { status: 'stable' },
    nodeFactory: (entry, parent, treeRuntime) =>
      createPlainNode(entry, parent, treeRuntime, visits),
    globalStateCounts: new Map(),
    globalState: {},
    loadSnapshot: undefined,
    latentRaw: new PathKeyedMap('pair'),
    typeMismatchPaths: new PathKeyedSet(),
    inactiveValuesMemo: new PathKeyedMap<readonly { path: string; value: unknown }[]>('path'),
  };
  return { root: createPlainNode(analysis.root, null, runtime, visits),
    blueprint: analysis, visits };
};
