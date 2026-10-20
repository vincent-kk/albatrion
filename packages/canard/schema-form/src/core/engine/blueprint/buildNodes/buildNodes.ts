import { isArray } from '@winglet/common-utils/filter';

import { DEFAULT_NO_ACTIVE } from '../effectiveSchema';
import { mergeSchemaContributions } from '../effectiveSchema';
import { selectEffectiveDeclarations } from '../effectiveSchema';
import type {
  AnalysisContext,
  MutableNode,
  SchemaInput,
} from '../types/analysis';
import type { PropertyDeclaration } from '../types/node';
import type {
  BlueprintNodeKind,
  BlueprintSchemaType,
  SchemaTypeName,
} from '../types/schema';
import { populateNodeChildren } from './utils/children/populateNodeChildren';
import { collectDeclarations } from './utils/declarations/collectDeclarations';
import { resolveNodeStrategy } from './utils/nodeTypes/resolveNodeStrategy';
import { resolveNodeTypes } from './utils/nodeTypes/resolveNodeTypes';
import { getTemplateKey } from './utils/references/getTemplateKey';

/** Captures the build environment once for this module's development checks. */
const developmentChecks = process.env.NODE_ENV !== 'production';

/** Static construction has no active gated declaration IDs. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = [];

/**
 * Construct schema templates once per authored declaration/gate combination.
 * @param context - Invocation-owned finite graph under construction
 * @param inputs - Contributions to this named slot in total order
 * @param path - First host occurrence used as a relative-template origin
 * @returns One static template, or distinct dynamic-only kind templates
 */
export const buildNodes = (
  context: AnalysisContext,
  inputs: readonly SchemaInput[],
  path: string,
): MutableNode[] => {
  const { key, boundKey } = getTemplateKey(context, inputs);
  const cached =
    context.templates.get(boundKey) ?? context.constructing.get(key);
  if (context.constructing.has(key)) context.staticFirstLoad = false;
  if (cached) return cached;
  const declarations: PropertyDeclaration[] = [];
  for (let index = 0; index < inputs.length; index++) {
    const start = declarations.length;
    collectDeclarations(
      context,
      inputs[index],
      path,
      undefined,
      undefined,
      declarations,
    );
    for (let item = start; item < declarations.length; item++)
      context.declarationInputs.set(declarations[item].id, index);
  }
  const groups = resolveNodeTypes(context, declarations);
  const nodes: MutableNode[] = [];
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    const nonNull: SchemaTypeName[] = [];
    let nullable = false;
    for (let type = 0; type < group.allowed.length; type++) {
      const allowed = group.allowed[type];
      if (allowed === 'null') nullable = true;
      else nonNull.push(allowed);
    }
    const schemaType: BlueprintSchemaType =
      nonNull.length > 1 ? Object.freeze(nonNull) : (nonNull[0] ?? 'null');
    const kind: BlueprintNodeKind = isArray(schemaType)
      ? 'union'
      : schemaType === 'integer'
        ? 'number'
        : schemaType;
    const ownedDeclarations = [];
    const conjunctions = [];
    for (let item = 0; item < group.declarations.length; item++) {
      const declaration = group.declarations[item];
      const owned =
        declaration.scope === 'fragment' &&
        declaration.context === 'declaration' &&
        kind !== 'object' &&
        kind !== 'array'
          ? {
              ...declaration,
              gates: [...declaration.gates],
              order: [...declaration.order],
              validationOnly: true,
            }
          : declaration;
      if (developmentChecks && owned !== declaration) {
        Object.freeze(owned.order);
        Object.freeze(owned.gates);
        Object.freeze(owned);
      }
      ownedDeclarations.push(owned);
      if (owned.context === 'conjunction') conjunctions.push(owned);
    }
    const node: MutableNode = {
      id: context.nodes.length,
      path,
      schemaPath: inputs[0].schemaPath,
      kind,
      schemaType,
      nullable,
      strategy: resolveNodeStrategy(context, kind, group.declarations),
      declarations: developmentChecks
        ? Object.freeze(ownedDeclarations)
        : ownedDeclarations,
      childEntries: [],
    };
    context.nodes.push(node);
    const effective = mergeSchemaContributions(
      node,
      selectEffectiveDeclarations(
        node,
        NO_ACTIVE_DECLARATION_IDS,
        conjunctions,
      ),
      {
        mode: 'static',
        isAtomic: context.options.isAtomic,
        collect: context.options.collect,
      },
    );
    if (
      ownedDeclarations.length === 1 &&
      ownedDeclarations[0].gates.length === 0 &&
      !node.nullable &&
      context.options.isAtomic === undefined &&
      context.options.collect === undefined
    ) {
      const declaration = ownedDeclarations[0];
      const schema = declaration.schema;
      if (
        declaration.context === 'conjunction' &&
        declaration.role === 'declaration' &&
        declaration.scope === 'node' &&
        !declaration.validationOnly &&
        (typeof schema === 'boolean' ||
          (schema.nullable === undefined &&
            schema.pattern === undefined &&
            !isArray(schema.type)))
      )
        DEFAULT_NO_ACTIVE.set(node, effective);
    }
    nodes.push(node);
  }
  context.templates.set(boundKey, nodes);
  context.constructing.set(key, nodes);
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.strategy === 'branch')
      populateNodeChildren(context, node, buildNodes);
  }
  context.constructing.delete(key);
  return nodes;
};
