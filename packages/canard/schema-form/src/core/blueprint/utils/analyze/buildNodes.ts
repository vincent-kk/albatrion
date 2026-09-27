import type {
  BlueprintChildEntry,
  BlueprintNodeKind,
  BlueprintSchemaType,
} from '../../type';
import { mergeEffectiveSchema } from '../effectiveSchema/mergeEffectiveSchema';
import { resolveNodeStrategy } from '../types/resolveNodeStrategy';
import { resolveNodeTypes } from '../types/resolveNodeTypes';
import { collectDeclarations } from './collectDeclarations';
import { getTemplateKey } from './getTemplateKey';
import { populateNodeChildren } from './populateNodeChildren';
import type { AnalysisContext, MutableNode, SchemaInput } from './type';

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
  const key = getTemplateKey(context, inputs);
  const boundKey = JSON.stringify([
    key,
    inputs.map((input) => input.gates.map((gate) => gate.hostPath)),
  ]);
  const cached =
    context.templates.get(boundKey) ?? context.constructing.get(key);
  if (cached) return cached;
  const declarations = inputs.flatMap((input) =>
    collectDeclarations(context, input, path),
  );
  const groups = resolveNodeTypes(context, declarations);
  const nodes = groups.map((group) => {
    const nonNull = group.allowed.filter((type) => type !== 'null');
    const schemaType: BlueprintSchemaType =
      nonNull.length > 1 ? Object.freeze(nonNull) : (nonNull[0] ?? 'null');
    const kind: BlueprintNodeKind = Array.isArray(schemaType)
      ? 'union'
      : schemaType === 'integer'
        ? 'number'
        : (schemaType as BlueprintNodeKind);
    const node: MutableNode = {
      id: context.nodes.length,
      path,
      schemaPath: inputs[0].schemaPath,
      kind,
      schemaType,
      nullable: group.allowed.includes('null'),
      strategy: resolveNodeStrategy(context, kind, group.declarations),
      declarations: Object.freeze(
        group.declarations.map((declaration) =>
          declaration.scope === 'fragment' &&
          declaration.context === 'declaration' &&
          kind !== 'object' &&
          kind !== 'array'
            ? Object.freeze({ ...declaration, validationOnly: true })
            : declaration,
        ),
      ),
      childEntries: [] as BlueprintChildEntry[],
    };
    context.nodes.push(node);
    mergeEffectiveSchema(
      {
        ...node,
        declarations: node.declarations.filter(
          (declaration) => declaration.context === 'conjunction',
        ),
      },
      [],
      {
        mode: 'static',
        isAtomic: context.options.isAtomic,
        collect: context.options.collect,
      },
    );
    return node;
  });
  context.templates.set(boundKey, nodes);
  context.constructing.set(key, nodes);
  for (const node of nodes)
    if (node.strategy === 'branch')
      populateNodeChildren(context, node, buildNodes);
  context.constructing.delete(key);
  return nodes;
};
