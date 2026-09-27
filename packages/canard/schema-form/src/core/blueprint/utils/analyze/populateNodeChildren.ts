import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintChildEntry } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { populateVirtualNodes } from './populateVirtualNodes';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext, MutableNode, SchemaInput } from './type';

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
            : Object.freeze({
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
      (Array.isArray(schema.type) &&
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
      schema.prefixItems ??
      (Array.isArray(schema.items) ? schema.items : undefined);
    if (schema.prefixItems !== undefined && !Array.isArray(schema.prefixItems))
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
    else if (schema.items !== undefined && typeof schema.items !== 'boolean') {
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
  }
  const entries = node.childEntries as BlueprintChildEntry[];
  for (const [name, inputs] of properties) {
    const path = `${node.path}/${escapeSegment(name)}`;
    for (const child of build(context, inputs, path)) {
      const declarations = child.declarations.map((declaration) =>
        Object.freeze({
          ...declaration,
          name,
          path,
          hostPath: node.path,
          schemaPath:
            declaration.schemaPath === child.schemaPath
              ? inputs[0].schemaPath
              : declaration.schemaPath,
          gates: Object.freeze(
            declaration.gates.map((gate) =>
              gate.hostPath === child.path
                ? Object.freeze({ ...gate, hostPath: path })
                : gate,
            ),
          ),
        }),
      );
      entries.push(
        Object.freeze({
          name,
          node: child,
          hostPath: node.path,
          declarations: Object.freeze(declarations),
        }),
      );
    }
  }
  if (itemInputs.length)
    node.item = build(context, itemInputs, `${node.path}/*`)[0];
  if (tuples.size)
    node.prefixItems = Object.freeze(
      [...tuples]
        .sort(([a], [b]) => a - b)
        .map(
          ([index, inputs]) =>
            build(context, inputs, `${node.path}/${index}`)[0],
        ),
    );
  if (node.kind === 'object') populateVirtualNodes(context, node);
};
