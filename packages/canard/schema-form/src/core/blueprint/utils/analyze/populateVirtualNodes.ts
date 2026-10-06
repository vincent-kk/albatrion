import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintChildEntry, PropertyDeclaration } from '../../type';
import { copyBlueprintDeclarations } from '../declarations/copyBlueprintDeclarations';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { resolveNodeStrategy } from '../types/resolveNodeStrategy';
import { collectDeclarations } from './collectDeclarations';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext, MutableNode } from './type';

/** Virtual bindings own their containers; authored fields remain borrowed inputs. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Bind virtual tuples to real sibling templates without rewriting schema keywords.
 * @param context - Construction state owning virtual nodes and declarations
 * @param host - Completed real-property host whose virtual groups are being bound
 * @returns Nothing; appends stable virtual child edges to the host
 */
export const populateVirtualNodes = (
  context: AnalysisContext,
  host: MutableNode,
): void => {
  const groups = new Map<
    string,
    { fields: readonly string[]; declarations: PropertyDeclaration[] }
  >();
  for (const declaration of host.declarations) {
    const virtual = readSchemaObject(declaration.schema).options?.virtual;
    if (virtual === undefined) continue;
    if (!virtual || typeof virtual !== 'object' || isArray(virtual))
      throwBlueprintError(
        BlueprintErrorCode.VirtualFieldsNotValid,
        `${declaration.schemaPath}/options/virtual`,
        {},
        context.options,
      );
    for (const [name, value] of Object.entries(virtual)) {
      const schema = readSchemaObject(value as Record<string, unknown>);
      const schemaPath = `${declaration.schemaPath}/options/virtual/${escapeSegment(name)}`;
      const fields = schema.fields;
      if (
        !isArray(fields) ||
        fields.some((field) => typeof field !== 'string') ||
        fields.some((field, index) => fields.indexOf(field) !== index)
      )
        throwBlueprintError(
          BlueprintErrorCode.VirtualFieldsNotValid,
          schemaPath,
          { fields },
          context.options,
        );
      for (const field of fields)
        if (
          !host.childEntries.some(
            (edge) => edge.name === field && edge.node.kind !== 'virtual',
          )
        )
          throwBlueprintError(
            BlueprintErrorCode.VirtualFieldsNotInProperties,
            schemaPath,
            { field },
            context.options,
          );
      const group = groups.get(name);
      if (
        group &&
        (group.fields.length !== fields.length ||
          group.fields.some((field, index) => field !== fields[index]))
      )
        throwBlueprintError(
          BlueprintErrorCode.VirtualFieldsMismatch,
          schemaPath,
          { name, fields, previous: group.fields },
          context.options,
        );
      const declarations = collectDeclarations(
        context,
        {
          schema,
          schemaPath,
          context: declaration.context,
          gates: declaration.gates,
          order: [
            ...declaration.order,
            0,
            host.childEntries.length + groups.size,
          ],
          role: 'declaration',
          inherited: declaration.inherited,
          hostPath: host.path,
          fragment: context.fragments[declaration.fragmentId],
        },
        `${host.path}/${escapeSegment(name)}`,
      );
      if (group) group.declarations.push(...declarations);
      else
        groups.set(name, {
          fields: DEVELOPMENT ? Object.freeze([...fields]) : [...fields],
          declarations,
        });
    }
  }
  for (const [name, group] of groups) {
    const childEntries: BlueprintChildEntry[] = [];
    for (let field = 0; field < group.fields.length; field++) {
      for (let index = 0; index < host.childEntries.length; index++) {
        const edge = host.childEntries[index];
        if (edge.name !== group.fields[field]) continue;
        const copy = {
          ...edge,
          declarations: copyBlueprintDeclarations(edge.declarations),
        };
        childEntries.push(DEVELOPMENT ? Object.freeze(copy) : copy);
      }
    }
    const node: MutableNode = {
      id: context.nodes.length,
      path: `${host.path}/${escapeSegment(name)}`,
      schemaPath: group.declarations[0].schemaPath,
      kind: 'virtual',
      schemaType: 'virtual',
      nullable: false,
      strategy: resolveNodeStrategy(context, 'virtual', group.declarations),
      declarations: DEVELOPMENT
        ? Object.freeze(group.declarations)
        : group.declarations,
      childEntries,
      fields: group.fields,
    };
    context.nodes.push(node);
    const entry = {
      name,
      node,
      declarations: copyBlueprintDeclarations(node.declarations),
      hostPath: host.path,
    };
    (host.childEntries as BlueprintChildEntry[]).push(
      DEVELOPMENT ? Object.freeze(entry) : entry,
    );
  }
};
