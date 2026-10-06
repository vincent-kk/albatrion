import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { createBlueprintGate } from './createBlueprintGate';
import { appendChildEntries } from './populateNodeChildren/utils/appendChildEntries';
import { populateVirtualNodes } from './populateVirtualNodes';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext, MutableNode, SchemaInput } from './type';

/** Host binding memberships are owned even when their templates are shared. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Bind object properties and array templates without allocating runtime nodes.
 * @param context - Root-local graph and declaration state
 * @param node - Already registered template, allowing recursive back-references
 * @param build - Owner's recursive template constructor
 * @returns Nothing; fills the template's construction-only child lists
 */
export const populateNodeChildren = (
  context: AnalysisContext,
  node: MutableNode,
  build: (
    context: AnalysisContext,
    inputs: readonly SchemaInput[],
    path: string,
  ) => MutableNode[],
): void => {
  if (node.kind === 'object' && node.declarations.length === 1) {
    const declaration = node.declarations[0];
    const schema = readSchemaObject(declaration.schema);
    if (
      declaration.context === 'conjunction' &&
      declaration.gates.length === 0 &&
      !schema.controls?.children?.length &&
      schema.properties &&
      typeof schema.properties === 'object'
    ) {
      const base = {
        context: declaration.context,
        gates: declaration.gates,
        inherited: declaration.inherited,
        hostPath: node.path,
        fragment: context.fragments[declaration.fragmentId],
        role: 'declaration' as const,
      };
      const properties = Object.entries(schema.properties);
      for (let index = 0; index < properties.length; index++) {
        const [name, child] = properties[index];
        const input: SchemaInput = {
          context: base.context,
          gates: base.gates,
          inherited: base.inherited,
          hostPath: base.hostPath,
          fragment: base.fragment,
          role: base.role,
          schema: child as SchemaInput['schema'],
          schemaPath: `${declaration.schemaPath}/properties/${escapeSegment(name)}`,
          order: [...declaration.order, 0, index],
        };
        input.gates = [];
        const path = `${node.path}/${escapeSegment(name)}`;
        appendChildEntries(
          node,
          name,
          path,
          input.schemaPath,
          build(context, [input], path),
        );
      }
      populateVirtualNodes(context, node);
      return;
    }
  }
  const properties = new Map<string, SchemaInput[]>();
  const itemInputs: SchemaInput[] = [];
  const tuples = new Map<number, SchemaInput[]>();
  const childrenControls = node.declarations.flatMap((owner) =>
    (readSchemaObject(owner.schema).controls?.children ?? []).map(
      (
        entry: { targets: string[]; controls?: Record<string, unknown> },
        index: number,
      ) => ({
        entry,
        gate:
          entry.controls?.active === undefined
            ? undefined
            : createBlueprintGate({
                kind: 'active' as const,
                schemaPath: `${owner.schemaPath}/controls/children/${index}/controls/active`,
                hostPath: node.path,
                condition: entry.controls.active,
                ...(owner.gates.length ? { appliesWhen: owner.gates } : {}),
              }),
      }),
    ),
  );
  for (const declaration of node.declarations) {
    const schema = readSchemaObject(declaration.schema);
    if (
      schema.type === 'null' ||
      (isArray(schema.type) &&
        schema.type.length === 1 &&
        schema.type[0] === 'null')
    )
      continue;
    const base = {
      context: declaration.context,
      gates: declaration.gates,
      inherited: declaration.inherited,
      hostPath: node.path,
      fragment: context.fragments[declaration.fragmentId],
      role: 'declaration' as const,
    };
    if (
      node.kind === 'object' &&
      schema.properties &&
      typeof schema.properties === 'object'
    )
      Object.entries(schema.properties).forEach(([name, child], index) => {
        const input: SchemaInput = {
          ...base,
          schema: child as SchemaInput['schema'],
          schemaPath: `${declaration.schemaPath}/properties/${escapeSegment(name)}`,
          order: [...declaration.order, 0, index],
        };
        const entryGates = childrenControls
          .filter(
            ({ entry, gate }) =>
              entry.targets.includes(name) && gate !== undefined,
          )
          .map(({ gate }) => gate!);
        input.gates = [...input.gates, ...entryGates];
        const existing = properties.get(name);
        if (existing) existing.push(input);
        else properties.set(name, [input]);
        const discriminatorIndex = input.gates.findIndex(
          (gate) =>
            gate.kind === 'discriminator' &&
            (gate.condition as { propertyName?: string }).propertyName === name,
        );
        if (discriminatorIndex >= 0)
          properties.get(name)!.push({
            ...input,
            gates: input.gates.slice(0, discriminatorIndex),
            context: 'declaration',
          });
      });
    if (node.kind !== 'array') continue;
    const tuple =
      schema.prefixItems ?? (isArray(schema.items) ? schema.items : undefined);
    if (schema.prefixItems !== undefined && !isArray(schema.prefixItems))
      throwBlueprintError(
        BlueprintErrorCode.UnexpectedArraySchema,
        declaration.schemaPath,
        { prefixItems: schema.prefixItems },
        context.options,
      );
    if (tuple)
      tuple.forEach((child: SchemaInput['schema'], index: number) => {
        const input: SchemaInput = {
          ...base,
          schema: child,
          schemaPath: `${declaration.schemaPath}/${schema.prefixItems ? 'prefixItems' : 'items'}/${index}`,
          order: [...declaration.order, 0, index],
        };
        const existing = tuples.get(index);
        if (existing) existing.push(input);
        else tuples.set(index, [input]);
      });
    if (
      schema.items !== undefined &&
      typeof schema.items !== 'boolean' &&
      !isArray(schema.items)
    ) {
      if (schema.items === null || typeof schema.items !== 'object')
        throwBlueprintError(
          BlueprintErrorCode.UnexpectedArraySchema,
          declaration.schemaPath,
          { items: schema.items },
          context.options,
        );
      itemInputs.push({
        ...base,
        schema: schema.items,
        schemaPath: `${declaration.schemaPath}/items`,
        order: [...declaration.order, 0, 0],
      });
    }
    const additionalItems =
      isArray(schema.items) && schema.prefixItems === undefined
        ? schema.additionalItems
        : undefined;
    if (
      additionalItems !== null &&
      typeof additionalItems === 'object' &&
      !isArray(additionalItems)
    )
      itemInputs.push({
        ...base,
        schema: additionalItems,
        schemaPath: `${declaration.schemaPath}/additionalItems`,
        order: [...declaration.order, 0, schema.items.length],
      });
  }
  for (const [name, inputs] of properties) {
    const path = `${node.path}/${escapeSegment(name)}`;
    const children = build(context, inputs, path);
    appendChildEntries(node, name, path, inputs[0].schemaPath, children);
  }
  if (itemInputs.length)
    node.item = build(context, itemInputs, `${node.path}/*`)[0];
  if (tuples.size)
    node.prefixItems = [...tuples]
      .sort(([a], [b]) => a - b)
      .map(
        ([index, inputs]) => build(context, inputs, `${node.path}/${index}`)[0],
      );
  if (DEVELOPMENT && node.prefixItems) Object.freeze(node.prefixItems);
  if (node.kind === 'object') populateVirtualNodes(context, node);
};
