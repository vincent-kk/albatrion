import { blueprint } from '../../../blueprint';
import type { Blueprint, BlueprintSchema, BlueprintGate } from '../../../blueprint';
import type { SchemaNodeRuntime } from '../../../record';
import { ifPredicate } from '../../../__tests__/ifPredicate';
import { createPlainNode } from './createPlainNode';
import type { PlainNode } from './createPlainNode';

/**
 * Compose one analyzed schema and a plain-record factory for settlement tests.
 * @param schema - Authored root to analyze with the real blueprint compiler
 * @param predicate - Optional synchronous if guard using the PR-4 return shape
 * @returns Root, analysis, and visit log shared by all created records
 */
export const createTestTree = (
  schema: BlueprintSchema,
  predicate: (gateInput: unknown) => boolean = ifPredicate,
): { root: PlainNode; blueprint: Blueprint; visits: string[] } => {
  const analysis = blueprint(schema);
  const visits: string[] = [];
  const predicates = new Map<BlueprintGate, (gateInput: unknown) => boolean>();
  for (const node of analysis.nodes)
    for (const declaration of node.declarations)
      for (const gate of declaration.gates)
        if (gate.kind === 'if') predicates.set(gate, predicate);
  for (const node of analysis.nodes)
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          if (gate.kind === 'if') predicates.set(gate, predicate);
  const runtime: SchemaNodeRuntime<PlainNode> = {
    blueprint: analysis,
    ifPredicates: predicates,
    diagnostics: { status: 'stable' },
    budgets: { hostWheel: 32, transition: 32 },
    nodeFactory: (entry, parent, treeRuntime) =>
      createPlainNode(entry, parent, treeRuntime, visits),
    loadSnapshot: undefined,
    latentRaw: new Map(),
    typeMismatchPaths: new Set(),
    inactiveValuesMemo: new Map(),
  };
  return { root: createPlainNode(analysis.root, null, runtime, visits),
    blueprint: analysis, visits };
};
