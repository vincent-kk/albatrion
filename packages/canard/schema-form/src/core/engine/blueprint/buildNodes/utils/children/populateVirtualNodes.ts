import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext, MutableNode } from '../../../types/analysis';
import type {
  BlueprintChildEntry,
  PropertyDeclaration,
} from '../../../types/node';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { collectDeclarations } from '../declarations/collectDeclarations';
import { copyBlueprintDeclarations } from '../declarations/copyBlueprintDeclarations';
import { resolveNodeStrategy } from '../nodeTypes/resolveNodeStrategy';

/**
 * Bind virtual tuples to real sibling templates without rewriting schema keywords.
 * Virtual bindings own their containers; authored fields remain borrowed inputs, so only
 * the owned containers are frozen in development.
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
        FormErrorCode.VirtualFieldsNotValid,
        appendSegment(
          appendSegment(declaration.schemaPath, 'options'),
          'virtual',
        ),
        {},
        context.options,
      );
    for (const [name, value] of Object.entries(virtual)) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Virtual entries are authored values read before shape validation; callables and primitives reach the fields check, so a guard would narrow what is accepted.
      const schema = readSchemaObject(value as Dictionary<unknown>);
      const schemaPath = appendSegment(
        appendSegment(
          appendSegment(declaration.schemaPath, 'options'),
          'virtual',
        ),
        name,
      );
      const fields = schema.fields;
      let matchesEither = !isArray(fields);
      if (!matchesEither) {
        matchesEither = false;
        for (let index = 0, count = fields.length; index < count; index++) {
          if (!(index in fields)) {
            continue;
          }

          const field = fields[index];

          if (typeof field !== 'string') {
            matchesEither = true;
            break;
          }
        }
      }
      let matchesEither2 = matchesEither;
      if (!matchesEither2) {
        matchesEither2 = false;
        for (let index = 0, count = fields.length; index < count; index++) {
          if (!(index in fields)) {
            continue;
          }

          const field = fields[index];

          if (fields.indexOf(field) !== index) {
            matchesEither2 = true;
            break;
          }
        }
      }
      if (matchesEither2) {
        throwBlueprintError(
          FormErrorCode.VirtualFieldsNotValid,
          schemaPath,
          { fields },
          context.options,
        );
      }
      for (const field of fields) {
        let hasMatch = false;
        for (const edge of host.childEntries) {
          if (edge.name === field && edge.node.kind !== 'virtual') {
            hasMatch = true;
            break;
          }
        }
        if (!hasMatch) {
          throwBlueprintError(
            FormErrorCode.VirtualFieldsNotInProperties,
            schemaPath,
            { field },
            context.options,
          );
        }
      }
      const group = groups.get(name);
      if (group) {
        let mismatched = group.fields.length !== fields.length;
        if (!mismatched)
          for (let index = 0; index < group.fields.length; index++)
            if (group.fields[index] !== fields[index]) {
              mismatched = true;
              break;
            }
        if (mismatched)
          throwBlueprintError(
            FormErrorCode.VirtualFieldsMismatch,
            schemaPath,
            { name, fields, previous: group.fields },
            context.options,
          );
      }
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
        appendSegment(host.path, name),
      );
      if (group) group.declarations.push(...declarations);
      else
        groups.set(name, {
          fields:
            process.env.NODE_ENV !== 'production'
              ? Object.freeze([...fields])
              : [...fields],
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
        childEntries.push(
          process.env.NODE_ENV !== 'production' ? Object.freeze(copy) : copy,
        );
      }
    }
    const node: MutableNode = {
      id: context.nodes.length,
      path: appendSegment(host.path, name),
      schemaPath: group.declarations[0].schemaPath,
      kind: 'virtual',
      schemaType: undefined,
      nullable: false,
      strategy: resolveNodeStrategy(context, 'virtual', group.declarations),
      declarations:
        process.env.NODE_ENV !== 'production'
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
    host.childEntries.push(
      process.env.NODE_ENV !== 'production' ? Object.freeze(entry) : entry,
    );
  }
};
