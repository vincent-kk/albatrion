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
    hostWheelBudget?: number;
    transitionBudget?: number;
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
    budgets: {
      hostWheel: options.hostWheelBudget ?? 32,
      transition: options.transitionBudget ?? 32,
    },
    loadSnapshot: options.snapshot,
    latentRaw: new Map<string, unknown>(),
    typeMismatchPaths: new Set<string>(),
    inactiveValuesMemo: new Map<string, readonly { path: string; value: unknown }[]>(),
  };
  const root = schemaNodeFactory(analysis, runtime);
  return { root, runtime: Reflect.get(root, 'runtime') as object };
};
