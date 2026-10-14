import type { Blueprint, BlueprintOptions, BlueprintSchema } from './type';
import { buildNodes } from './utils/analyze/buildNodes';
import { compileBlueprintExpressions } from './utils/analyze/compileBlueprintExpressions';
import type { AnalysisContext } from './utils/analyze/type';
import { validateShape } from './utils/analyze/validateShape';
import { collectBlueprintWarnings } from './utils/diagnostics/collectBlueprintWarnings';
import { validateChildTargets } from './utils/diagnostics/validateChildTargets';

/**
 * Analyze authored schema data into an immutable, finite declaration graph.
 * @param schema - Authored root, retained by reference and never mutated
 * @param options - Injected renderer predicates, diagnostics, and caller-owned cache
 * @returns The stable blueprint for this root and predicate identity
 */
export const blueprint = (
  schema: BlueprintSchema,
  options: BlueprintOptions = {},
): Blueprint => {
  const entries =
    typeof schema === 'object' ? options.cache?.get(schema) : undefined;
  const cached = entries?.find(
    (entry) =>
      entry.isTerminal === options.isTerminal &&
      entry.isAtomic === options.isAtomic,
  );
  if (cached) {
    if (options.collect && !cached.warningsCollected) {
      collectBlueprintWarnings(cached.blueprint, options.collect);
      cached.warningsCollected = true;
    }
    return cached.blueprint;
  }
  const context: AnalysisContext = {
    schema,
    options,
    nodes: [],
    fragments: [],
    declarationId: 0,
    declarationOwners: new Map(),
    templates: new Map(),
    constructing: new Map(),
    dependencies: Object.create(null),
  };
  const [root] = buildNodes(
    context,
    [
      {
        schema,
        schemaPath: '#',
        context: 'conjunction',
        role: 'declaration',
        gates: [],
        order: [],
        inherited: false,
        hostPath: '',
      },
    ],
    '',
  );
  validateShape(context);
  validateChildTargets(context);
  const expressions = compileBlueprintExpressions(context);
  for (const node of context.nodes) {
    Object.freeze(node.childEntries);
    Object.freeze(node);
  }
  for (const fragment of context.fragments) {
    Object.freeze(fragment.declares);
    Object.freeze(fragment.overlays);
    Object.freeze(fragment.inheritedOverlays);
    Object.freeze(fragment.children);
    Object.freeze(fragment);
  }
  const result = Object.freeze({
    isAtomic: options.isAtomic,
    isTerminal: options.isTerminal,
    schema,
    root,
    nodes: Object.freeze(context.nodes),
    fragments: Object.freeze(context.fragments),
    dependencies: Object.freeze(context.dependencies),
    expressions,
  });
  collectBlueprintWarnings(result, options.collect);
  if (typeof schema === 'object' && options.cache) {
    const entry = {
      blueprint: result,
      isTerminal: options.isTerminal,
      isAtomic: options.isAtomic,
      warningsCollected: options.collect !== undefined,
    };
    if (entries) entries.push(entry);
    else options.cache.set(schema, [entry]);
  }
  return result;
};
