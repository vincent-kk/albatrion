import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { StaticFirstLoadCapability } from './StaticFirstLoadCapability';
import { buildNodes } from './buildNodes';
import { collectBlueprintWarnings } from './collectBlueprintWarnings';
import { compileBlueprintExpressions } from './compileBlueprintExpressions';
import type { AnalysisContext } from './types/analysis';
import type { Blueprint, BlueprintOptions } from './types/blueprint';
import type { BlueprintSchema } from './types/schema';
import { markCandidateDescendants } from './utils/features/markCandidateDescendants';
import { validateChildTargets } from './validateChildTargets';
import { validateShape } from './validateShape';

/** Captures the build environment once for this module's development checks. */
const developmentChecks = process.env.NODE_ENV !== 'production';

/** Shared options for a build without injected predicates, collector, or cache. */
const DEFAULT_BLUEPRINT_OPTIONS: BlueprintOptions = {};

/**
 * Analyze authored schema data into an immutable, finite declaration graph.
 * @param schema - Authored root, retained by reference and never mutated
 * @param options - Injected renderer predicates, diagnostics, and caller-owned cache
 * @returns The stable blueprint for this root and predicate identity
 */
export const blueprint = (
  schema: BlueprintSchema,
  options: BlueprintOptions = DEFAULT_BLUEPRINT_OPTIONS,
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
    hasChildTargets: false,
    staticFirstLoad: true,
    capabilities: {
      branchless: true,
      hasExpressions: false,
      hasDerive: false,
      hasWatch: false,
      hasState: false,
      hasDependencies: false,
    },
    schema,
    options,
    nodes: [],
    fragments: [],
    declarationId: 0,
    declarationOwners: undefined,
    templates: new Map(),
    constructing: new Map(),
    declarationInputs: new Map(),
    dependencies: undefined,
  };
  const [root] = buildNodes(
    context,
    [
      {
        schema,
        schemaPath: $.Fragment,
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
  if (context.hasChildTargets) validateChildTargets(context);
  markCandidateDescendants(context.nodes);
  const expressions =
    context.capabilities.hasExpressions || context.capabilities.hasWatch
      ? compileBlueprintExpressions(context)
      : [];
  for (let index = 0; index < context.nodes.length; index++) {
    const node = context.nodes[index];
    if (
      node.kind === 'virtual' ||
      node.kind === 'union' ||
      ((node.kind === 'object' || node.kind === 'array') &&
        node.strategy !== 'branch')
    )
      context.staticFirstLoad = false;
    if (developmentChecks) {
      Object.freeze(node.childEntries);
      Object.freeze(node);
    }
  }
  if (developmentChecks)
    for (let index = 0; index < context.fragments.length; index++) {
      const fragment = context.fragments[index];
      Object.freeze(fragment.declares);
      Object.freeze(fragment.overlays);
      Object.freeze(fragment.inheritedOverlays);
      Object.freeze(fragment.children);
      Object.freeze(fragment);
    }
  const result: Blueprint = {
    capabilities: context.capabilities,
    isAtomic: options.isAtomic,
    isTerminal: options.isTerminal,
    schema,
    root,
    nodes: context.nodes,
    fragments: context.fragments,
    dependencies: context.dependencies ?? Object.create(null),
    expressions,
  };
  if (developmentChecks) {
    Object.freeze(context.capabilities);
    Object.freeze(context.nodes);
    Object.freeze(context.fragments);
    Object.freeze(result.dependencies);
    if (!context.capabilities.hasExpressions && !context.capabilities.hasWatch)
      Object.freeze(expressions);
    Object.freeze(result);
  }
  const capabilities = result.capabilities;
  StaticFirstLoadCapability.set(
    result,
    context.staticFirstLoad &&
      capabilities.branchless &&
      !capabilities.hasExpressions &&
      !capabilities.hasDerive &&
      !capabilities.hasWatch &&
      !capabilities.hasState &&
      !capabilities.hasDependencies,
  );
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
