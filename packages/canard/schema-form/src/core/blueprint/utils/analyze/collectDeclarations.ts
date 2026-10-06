import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintGate, PropertyDeclaration } from '../../type';
import { validateControlGroups } from '../diagnostics/validateControlGroups';
import { readAllowedTypes } from '../types/readAllowedTypes';
import { collectSchemaCapabilities } from './collectSchemaCapabilities';
import { createBlueprintGate } from './createBlueprintGate';
import { readDiscriminatorBranches } from './readDiscriminatorBranches';
import { readSchemaObject } from './readSchemaObject';
import { resolveReference } from './resolveReference';
import type { AnalysisContext, SchemaInput } from './type';

/** Keyword ranks form the authored total order, independent of object insertion order. */
const FRAGMENT_KEYWORDS = [
  ['allOf', 1],
  ['then', 2],
  ['else', 2],
  ['oneOf', 3],
  ['anyOf', 4],
] as const;
/** Only producer-owned internal records receive development protection. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Expand one slot's fragments in keyword order without expanding child nodes.
 * @param context - Construction state owning IDs and fragment tables
 * @param input - Authored contribution and its inherited gate context
 * @param path - Data host of this slot
 * @param visiting - Authored positions currently expanded within this slot
 * @param ownerId - Root contribution whose reference and fragment overlays are expanded
 * @param result - Owner's ordered sink; omitted calls allocate their own array
 * @returns The sink after expansion, with finite reference cycles cut at re-entry
 */
export const collectDeclarations = (
  context: AnalysisContext,
  input: SchemaInput,
  path: string,
  visiting: readonly string[] = [],
  ownerId?: number,
  result: PropertyDeclaration[] = [],
): PropertyDeclaration[] => {
  if (visiting.includes(input.schemaPath)) return result;
  const schema = readSchemaObject(input.schema);
  validateControlGroups(
    context,
    input.schema,
    input.schemaPath,
    input.isFragment ?? false,
  );
  readAllowedTypes(input.schema, input.schemaPath, context.options);
  collectSchemaCapabilities(context, input.schema);
  if (input.gates.length || input.context === 'declaration')
    context.capabilities.branchless = false;
  const gates: BlueprintGate[] = input.gates.slice();
  if (
    schema.controls?.active !== undefined &&
    !gates.some(
      (gate) => gate.schemaPath === `${input.schemaPath}/controls/active`,
    )
  )
    gates.push(
      createBlueprintGate({
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
    order: input.order.slice(),
    gates,
    declares: [] as number[],
    overlays: [] as number[],
    inheritedOverlays: [] as number[],
    children: [] as number[],
  };
  context.fragments.push(fragment);
  input.fragment?.children.push(fragment.id);
  const declaration: PropertyDeclaration = {
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
    gates: fragment.gates.slice(),
    order: fragment.order.slice(),
    inherited: input.inherited,
    hostPath: input.hostPath,
  };
  if (DEVELOPMENT) {
    Object.freeze(fragment.order);
    Object.freeze(fragment.gates);
    Object.freeze(declaration.order);
    Object.freeze(declaration.gates);
    Object.freeze(declaration);
  }
  fragment[input.role === 'declaration' ? 'declares' : 'overlays'].push(
    declaration.id,
  );
  if (input.inherited) fragment.inheritedOverlays.push(declaration.id);
  result.push(declaration);
  const owner = ownerId ?? declaration.id;
  if (!context.capabilities.branchless)
    (context.declarationOwners ??= new Map()).set(declaration.id, owner);
  const discriminators =
    schema.controls?.discriminator === undefined
      ? undefined
      : readDiscriminatorBranches(context, input.schema, input.schemaPath);
  if (discriminators?.size) {
    context.discriminatorBranches ??= new Set<string>();
    for (const branchPath of discriminators.keys())
      context.discriminatorBranches.add(branchPath);
  }
  if (typeof schema.$ref !== 'string' && schema.allOf === undefined &&
    schema.if === undefined && schema.oneOf === undefined && schema.anyOf === undefined)
    return result;
  const stack = [...visiting, input.schemaPath];
  if (typeof schema.$ref === 'string') {
    const target = resolveReference(context, schema.$ref, input.schemaPath);
    collectDeclarations(
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
      result,
    );
  }
  for (
    let keywordIndex = 0;
    keywordIndex < FRAGMENT_KEYWORDS.length;
    keywordIndex++
  ) {
    const [keyword, rank] = FRAGMENT_KEYWORDS[keywordIndex];
    if ((keyword === 'then' || keyword === 'else') && schema.if === undefined)
      continue;
    const values =
      keyword === 'then' || keyword === 'else'
        ? [schema[keyword]]
        : schema[keyword];
    if (!isArray(values)) continue;
    for (let index = 0; index < values.length; index++) {
      const child = values[index];
      if (child === undefined || child === false) continue;
      const childPath = `${input.schemaPath}/${keyword}${keyword === 'then' || keyword === 'else' ? '' : `/${index}`}`;
      const nestedGates = [...gates];
      const discriminator = discriminators?.get(childPath);
      if (discriminator)
        nestedGates.push(
          createBlueprintGate({
            kind: 'discriminator',
            schemaPath: childPath,
            hostPath: path,
            condition: discriminator,
          }),
        );
      if (keyword === 'then' || keyword === 'else')
        nestedGates.push(
          createBlueprintGate({
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
      collectDeclarations(
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
        result,
      );
    }
  }
  return result;
};
