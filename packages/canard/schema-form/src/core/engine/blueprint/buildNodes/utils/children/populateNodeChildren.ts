import {
  filter as filterArray,
  map as mapArray,
} from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import {
  PointerOperator,
  appendSegment,
  joinPointer,
  parsePointerSegments,
  rebasePointer,
} from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type {
  AnalysisContext,
  MutableNode,
  SchemaInput,
} from '../../../types/analysis';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { createBlueprintGate } from '../gates/createBlueprintGate';
import { appendChildEntries } from './appendChildEntries';
import { assertAddressableName } from './assertAddressableName';
import { populateVirtualNodes } from './populateVirtualNodes';

/**
 * Bind object properties and array templates without allocating runtime nodes.
 * Host binding memberships are owned even when their templates are shared, so they
 * are frozen in development while the shared templates are not.
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
      !schema.controls?.fields?.length &&
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
      const propertiesPath = appendSegment(
        declaration.schemaPath,
        'properties',
      );
      const properties = Object.entries(schema.properties);
      for (let index = 0; index < properties.length; index++) {
        const [name, child] = properties[index];
        assertAddressableName(context, declaration.schemaPath, name);
        const path = appendSegment(node.path, name);
        const input: SchemaInput = {
          context: base.context,
          gates: base.gates,
          inherited: base.inherited,
          hostPath: base.hostPath,
          fragment: base.fragment,
          role: base.role,
          schema: child,
          schemaPath: rebasePointer(path, node.path, propertiesPath),
          order: [...declaration.order, 0, index],
        };
        input.gates = [];
        appendChildEntries(
          node,
          name,
          path,
          input.schemaPath,
          build(context, [input], path),
          [input],
          context.declarationInputs,
        );
      }
      populateVirtualNodes(context, node);
      return;
    }
  }
  const properties = new Map<string, { path: string; inputs: SchemaInput[] }>();
  const itemInputs: SchemaInput[] = [];
  const tuples = new Map<number, SchemaInput[]>();
  const fieldControls = node.declarations.flatMap((owner) =>
    mapArray(
      readSchemaObject(owner.schema).controls?.fields ?? [],
      (
        entry: { targets: string[]; controls?: Dictionary<unknown> },
        index: number,
      ) => ({
        entry,
        gate:
          entry.controls?.active === undefined
            ? undefined
            : createBlueprintGate({
                kind: 'active' as const,
                schemaPath: appendSegment(
                  appendSegment(
                    appendSegment(
                      appendSegment(
                        appendSegment(owner.schemaPath, 'controls'),
                        'fields',
                      ),
                      index,
                    ),
                    'controls',
                  ),
                  'active',
                ),
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
      (() => {
        const items = Object.entries(schema.properties);
        for (
          let position = 0, count = items.length;
          position < count;
          position++
        ) {
          if (!(position in items)) continue;
          const item = items[position];
          const [name, child] = item;
          const index = position;
          {
            assertAddressableName(context, declaration.schemaPath, name);
            const existing = properties.get(name);
            const path = existing?.path ?? appendSegment(node.path, name);
            const input: SchemaInput = {
              ...base,
              schema: child,
              schemaPath: rebasePointer(
                path,
                node.path,
                appendSegment(declaration.schemaPath, 'properties'),
              ),
              order: [...declaration.order, 0, index],
            };
            const entryGates = mapArray(
              filterArray(
                fieldControls,
                ({ entry, gate }) =>
                  entry.targets.includes(name) && gate !== undefined,
              ),
              ({ gate }) => gate!,
            );
            input.gates = [...input.gates, ...entryGates];
            if (existing) existing.inputs.push(input);
            else
              properties.set(name, {
                path,
                inputs: [input],
              });
            const discriminatorIndex = input.gates.findIndex(
              (gate) =>
                gate.kind === 'discriminator' &&
                gate.condition.propertyName === name,
            );
            if (discriminatorIndex >= 0)
              properties.get(name)!.inputs.push({
                ...input,
                gates: input.gates.slice(0, discriminatorIndex),
                context: 'declaration',
              });
          }
        }
      })();
    if (node.kind !== 'array') continue;
    const tuple =
      schema.prefixItems ?? (isArray(schema.items) ? schema.items : undefined);
    if (schema.prefixItems !== undefined && !isArray(schema.prefixItems))
      throwBlueprintError(
        FormErrorCode.UnexpectedArraySchema,
        declaration.schemaPath,
        { prefixItems: schema.prefixItems },
        context.options,
      );
    if (tuple)
      (() => {
        const values = tuple;
        for (
          let position = 0, count = values.length;
          position < count;
          position++
        ) {
          if (!(position in values)) continue;
          const item = values[position];
          const child: SchemaInput['schema'] = item;
          const index: number = position;
          {
            const input: SchemaInput = {
              ...base,
              schema: child,
              schemaPath: appendSegment(
                appendSegment(
                  declaration.schemaPath,
                  schema.prefixItems ? 'prefixItems' : 'items',
                ),
                index,
              ),
              order: [...declaration.order, 0, index],
            };
            const existing = tuples.get(index);
            if (existing) existing.push(input);
            else tuples.set(index, [input]);
          }
        }
      })();
    if (
      schema.items !== undefined &&
      typeof schema.items !== 'boolean' &&
      !isArray(schema.items)
    ) {
      if (schema.items === null || typeof schema.items !== 'object')
        throwBlueprintError(
          FormErrorCode.UnexpectedArraySchema,
          declaration.schemaPath,
          { items: schema.items },
          context.options,
        );
      itemInputs.push({
        ...base,
        schema: schema.items,
        schemaPath: appendSegment(declaration.schemaPath, 'items'),
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
        schemaPath: appendSegment(declaration.schemaPath, 'additionalItems'),
        order: [...declaration.order, 0, schema.items.length],
      });
  }
  for (const [name, entry] of properties) {
    const { inputs, path } = entry;
    const children = build(context, inputs, path);
    appendChildEntries(
      node,
      name,
      path,
      inputs[0].schemaPath,
      children,
      inputs,
      context.declarationInputs,
    );
  }
  if (itemInputs.length) {
    const candidates = build(
      context,
      itemInputs,
      joinPointer([
        ...parsePointerSegments(node.path),
        PointerOperator.Wildcard,
      ]),
    );
    node.item = candidates[0];
    if (candidates.length > 1) {
      node.itemCandidates = candidates;
      context.staticFirstLoad = false;
    }
  }
  if (tuples.size) {
    const candidates = mapArray(
      [...tuples].sort(([a], [b]) => a - b),
      ([index, inputs]) =>
        build(context, inputs, appendSegment(node.path, index)),
    );
    node.prefixItems = mapArray(candidates, (items) => items[0]);
    if (
      (() => {
        const values = candidates;
        for (let index = 0, count = values.length; index < count; index++) {
          if (!(index in values)) continue;
          const items = values[index];
          if (items.length > 1) return true;
        }
        return false;
      })()
    ) {
      node.prefixItemCandidates = candidates;
      context.staticFirstLoad = false;
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    if (node.itemCandidates) Object.freeze(node.itemCandidates);
    if (node.prefixItemCandidates) {
      for (const candidates of node.prefixItemCandidates)
        Object.freeze(candidates);
      Object.freeze(node.prefixItemCandidates);
    }
    if (node.prefixItems) Object.freeze(node.prefixItems);
  }
  if (node.kind === 'object') populateVirtualNodes(context, node);
};
