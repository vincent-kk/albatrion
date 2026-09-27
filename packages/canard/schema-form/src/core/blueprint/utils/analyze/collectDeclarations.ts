import type { BlueprintGate, PropertyDeclaration } from '../../type';
import { validateControlGroups } from '../diagnostics/validateControlGroups';
import { readAllowedTypes } from '../types/readAllowedTypes';
import { readDiscriminatorBranches } from './readDiscriminatorBranches';
import { readSchemaObject } from './readSchemaObject';
import { resolveReference } from './resolveReference';
import type { AnalysisContext, SchemaInput } from './type';

/**
 * Expand one slot's fragments in keyword order without expanding child nodes.
 * @param context - Construction state owning IDs and fragment tables
 * @param input - Authored contribution and its inherited gate context
 * @param path - Data host of this slot
 * @param visiting - Authored positions currently expanded within this slot
 * @param ownerId - Root contribution whose reference and fragment overlays are expanded
 * @returns Ordered declarations, with finite reference cycles cut at their re-entry
 */
export const collectDeclarations = (
  context: AnalysisContext,
  input: SchemaInput,
  path: string,
  visiting: readonly string[] = [],
  ownerId?: number,
): PropertyDeclaration[] => {
  if (visiting.includes(input.schemaPath)) return [];
  const schema = readSchemaObject(input.schema);
  validateControlGroups(
    context,
    input.schema,
    input.schemaPath,
    input.isFragment ?? false,
  );
  readAllowedTypes(input.schema, input.schemaPath, context.options);
  const gates: BlueprintGate[] = [...input.gates];
  if (
    schema.controls?.active !== undefined &&
    !gates.some(
      (gate) => gate.schemaPath === `${input.schemaPath}/controls/active`,
    )
  )
    gates.push(
      Object.freeze({
        kind: 'active',
        schemaPath: `${input.schemaPath}/controls/active`,
        hostPath: path,
        condition: schema.controls.active,
      }),
    );
  const fragment = {
    id: context.fragments.length,
    hostPath: path,
    schemaPath: input.schemaPath,
    schema: input.schema,
    context: input.context,
    order: Object.freeze([...input.order]),
    gates: Object.freeze(gates),
    declares: [] as number[],
    overlays: [] as number[],
    inheritedOverlays: [] as number[],
    children: [] as number[],
  };
  context.fragments.push(fragment);
  input.fragment?.children.push(fragment.id);
  const declaration: PropertyDeclaration = Object.freeze({
    id: context.declarationId++,
    name: path.slice(path.lastIndexOf('/') + 1),
    path,
    schemaPath: input.schemaPath,
    schema: input.schema,
    fragmentId: fragment.id,
    role: input.role,
    scope: input.isFragment ? 'fragment' : 'node',
    validationOnly: false,
    context: input.context,
    gates: fragment.gates,
    order: fragment.order,
    inherited: input.inherited,
    hostPath: input.hostPath,
  });
  fragment[input.role === 'declaration' ? 'declares' : 'overlays'].push(
    declaration.id,
  );
  if (input.inherited) fragment.inheritedOverlays.push(declaration.id);
  const result = [declaration];
  const owner = ownerId ?? declaration.id;
  context.declarationOwners.set(declaration.id, owner);
  const discriminators = readDiscriminatorBranches(
    context,
    input.schema,
    input.schemaPath,
  );
  if (discriminators.size) {
    context.discriminatorBranches ??= new Set<string>();
    for (const branchPath of discriminators.keys())
      context.discriminatorBranches.add(branchPath);
  }
  const stack = [...visiting, input.schemaPath];
  if (typeof schema.$ref === 'string') {
    const target = resolveReference(context, schema.$ref, input.schemaPath);
    result.push(
      ...collectDeclarations(
        context,
        {
          ...input,
          ...target,
          gates,
          fragment,
          role: 'overlay',
          inherited: true,
        },
        path,
        stack,
        owner,
      ),
    );
  }
  for (const [keyword, rank] of [
    ['allOf', 1],
    ['then', 2],
    ['else', 2],
    ['oneOf', 3],
    ['anyOf', 4],
  ] as const) {
    if ((keyword === 'then' || keyword === 'else') && schema.if === undefined)
      continue;
    const values =
      keyword === 'then' || keyword === 'else'
        ? [schema[keyword]]
        : schema[keyword];
    if (!Array.isArray(values)) continue;
    values.forEach((child, index) => {
      if (child === undefined || child === false) return;
      const childPath = `${input.schemaPath}/${keyword}${keyword === 'then' || keyword === 'else' ? '' : `/${index}`}`;
      const nestedGates = [...gates];
      const discriminator = discriminators.get(childPath);
      if (discriminator)
        nestedGates.push(
          Object.freeze({
            kind: 'discriminator',
            schemaPath: childPath,
            hostPath: path,
            condition: discriminator,
          }),
        );
      if (keyword === 'then' || keyword === 'else')
        nestedGates.push(
          Object.freeze({
            kind: 'if',
            schemaPath: `${input.schemaPath}/if`,
            hostPath: path,
            condition: schema.if,
            negated: keyword === 'else',
          }),
        );
      const branch = keyword === 'oneOf' || keyword === 'anyOf';
      const active = readSchemaObject(child).controls?.active;
      const declarationOnly =
        input.context === 'declaration' ||
        (branch && active === undefined && discriminator === undefined);
      result.push(
        ...collectDeclarations(
          context,
          {
            schema: child,
            schemaPath: childPath,
            role: 'overlay',
            gates: nestedGates,
            context: declarationOnly ? 'declaration' : 'conjunction',
            order: [...input.order, rank, keyword === 'else' ? 1 : index],
            inherited: input.inherited,
            hostPath: path,
            fragment,
            isFragment: true,
          },
          path,
          stack,
          owner,
        ),
      );
    });
  }
  return result;
};
