import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import type {
  Blueprint,
  BlueprintOptions,
  BlueprintSchema,
} from '@/schema-form/core/engine/blueprint';
import { blueprint } from '@/schema-form/core/engine/blueprint';
import type { FieldNodeRuntime } from '@/schema-form/core/engine/record';
import { PathKeyedSet } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedSet';
import type { Validator } from '@/schema-form/core/engine/validation';

import type { PlainNode } from './createPlainNode';
import { createPlainNode } from './createPlainNode';

/**
 * Compose one analyzed schema and a plain-record factory for settlement tests.
 * @param schema - Authored root to analyze with the real blueprint compiler
 * @param validator - Selected validator using the core contract.
 * @param options - Renderer predicates supplied to blueprint analysis
 * @returns Root, analysis, and visit log shared by all created records
 */
export const createTestTree = (
  schema: BlueprintSchema,
  validator: Validator = createTestValidator(),
  options: BlueprintOptions = {},
  beforeRoot: (analysis: Blueprint) => void = () => {},
): { root: PlainNode; blueprint: Blueprint; visits: string[] } => {
  const analysis = blueprint(schema, options);
  const visits: string[] = [];
  const runtime: FieldNodeRuntime<PlainNode> = {
    deliveries: new Set(),
    blueprint: analysis,
    context: {},
    validator,
    diagnostics: { status: 'stable' },
    nodeFactory: (entry, parent, treeRuntime) =>
      createPlainNode(entry, parent, treeRuntime, visits),
    globalStateCounts: new Map(),
    globalState: {},
    loadSnapshot: undefined,

    misfitPaths: new PathKeyedSet(),
  };
  beforeRoot(analysis);
  return {
    root: createPlainNode(analysis.root, null, runtime, visits),
    blueprint: analysis,
    visits,
  };
};
