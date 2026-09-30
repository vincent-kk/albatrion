import { blueprint } from '../blueprint';
import type { BlueprintGate, BlueprintSchema } from '../blueprint';
import { schemaNodeFactory } from '../SchemaNode';

type IfPredicate = (input: unknown) => boolean;

/** Compile authored declarations and expose only the PR-2 node surface to tests. */
export const makeSchemaNodeTree = (
  schema: BlueprintSchema,
  options: {
    snapshot?: unknown;
    ifPredicate?: (gate: BlueprintGate) => IfPredicate;
  } = {},
) => {
  const analysis = blueprint(schema);
  const ifPredicates = new Map<BlueprintGate, IfPredicate>();
  if (options.ifPredicate) {
    for (const node of analysis.nodes) {
      for (const declaration of node.declarations)
        for (const gate of declaration.gates)
          if (gate.kind === 'if')
            ifPredicates.set(gate, options.ifPredicate(gate));
      for (const entry of node.childEntries)
        for (const declaration of entry.declarations)
          for (const gate of declaration.gates)
            if (gate.kind === 'if')
              ifPredicates.set(gate, options.ifPredicate(gate));
    }
  }
  const runtime = {
    ifPredicates,
    diagnostics: { status: 'stable' as const },
    loadSnapshot: options.snapshot,
    latentRaw: new Map<string, unknown>(),
    typeMismatchPaths: new Set<string>(),
    inactiveValuesMemo: new Map<string, readonly { path: string; value: unknown }[]>(),
  };
  const root = schemaNodeFactory(analysis, runtime);
  const treeRuntime: unknown = Reflect.get(root, 'runtime');
  if (treeRuntime === null || typeof treeRuntime !== 'object')
    throw new Error('SchemaNode tree runtime is missing');
  return { root, runtime: treeRuntime };
};
