import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isArray } from '@winglet/common-utils/filter';

import {
  appendSegment,
  readFormattedPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type {
  AnalysisContext,
  MutableFragment,
  SchemaInput,
} from '../../../types/analysis';
import type { BlueprintGate, PropertyDeclaration } from '../../../types/node';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { createBlueprintGate } from '../gates/createBlueprintGate';
import { resolveReference } from '../references/resolveReference';
import { getResourceIndex } from '../references/resources/getResourceIndex';
import { collectSchemaCapabilities } from './collectSchemaCapabilities';
import { readDiscriminatorBranches } from './readDiscriminatorBranches';
import { validateControlGroups } from './validateControlGroups';
import { validatePresentation } from './validatePresentation';
import { validateSchemaOptions } from './validateSchemaOptions';

/** Annotates the lazily created `declarationOwners`; an argument-less `new Map()` would be `Map<any, any>`. */
type DeclarationOwners = Map<number, number>;

/** Keyword ranks form the authored total order, independent of object insertion order. */
const FRAGMENT_KEYWORDS = [
  ['allOf', 1],
  ['then', 2],
  ['else', 2],
  ['oneOf', 3],
  ['anyOf', 4],
] as const;

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
  visiting: readonly string[] = EMPTY_ARRAY,
  ownerId?: number,
  result: PropertyDeclaration[] = [],
): PropertyDeclaration[] => {
  if (visiting.includes(input.schemaPath)) return result;
  const schema = readSchemaObject(input.schema);
  if (typeof schema.$id === 'string' && input.schema !== context.schema)
    getResourceIndex(context);
  validateControlGroups(
    context,
    input.schema,
    input.schemaPath,
    input.isFragment ?? false,
  );
  validateSchemaOptions(context, schema.options, input.schemaPath);
  validatePresentation(context, schema.presentation, input.schemaPath);
  readAllowedTypes(input.schema, input.schemaPath, context.options);
  collectSchemaCapabilities(context, input.schema);
  if (input.gates.length || input.context === 'declaration')
    context.capabilities.isBranchless = false;
  const gates: BlueprintGate[] = input.gates.slice();
  let matches = schema.controls?.active !== undefined;
  if (matches) {
    let hasInvalidSchemaType = false;
    for (let index = 0, count = gates.length; index < count; index++) {
      const gate = gates[index];

      if (
        gate.schemaPath ===
        appendSegment(appendSegment(input.schemaPath, 'controls'), 'active')
      ) {
        hasInvalidSchemaType = true;
        break;
      }
    }
    matches = !hasInvalidSchemaType;
  }
  if (matches) {
    gates.push(
      createBlueprintGate({
        kind: 'active',
        schemaPath: appendSegment(
          appendSegment(input.schemaPath, 'controls'),
          'active',
        ),
        hostPath: path,
        condition: schema.controls.active,
      }),
    );
  }
  let referenceTarget: ReturnType<typeof resolveReference> | undefined;
  if (typeof schema.$ref === 'string') {
    let references: Set<string> | undefined;
    let reference = schema.$ref;
    let location = input.schemaPath;
    while (true) {
      const target = resolveReference(context, reference, location);
      referenceTarget ??= target;
      if (
        target.schemaPath === input.schemaPath ||
        visiting.includes(target.schemaPath) ||
        references?.has(target.schemaPath)
      )
        break;
      const targetSchema = readSchemaObject(target.schema);
      if (targetSchema.controls?.active !== undefined) {
        const schemaPath = appendSegment(
          appendSegment(target.schemaPath, 'controls'),
          'active',
        );
        if (!gates.some((gate) => gate.schemaPath === schemaPath))
          gates.push(
            createBlueprintGate({
              kind: 'active',
              schemaPath,
              hostPath: path,
              condition: targetSchema.controls.active,
            }),
          );
      }
      if (typeof targetSchema.$ref !== 'string') break;
      (references ??= new Set()).add(target.schemaPath);
      reference = targetSchema.$ref;
      location = target.schemaPath;
    }
  }
  const fragment: MutableFragment = {
    id: context.fragments.length,
    hostPath: path,
    schemaPath: input.schemaPath,
    schema: input.schema,
    context: input.context,
    order: input.order.slice(),
    gates,
    declares: [],
    overlays: [],
    inheritedOverlays: [],
    children: [],
  };
  context.fragments.push(fragment);
  input.fragment?.children.push(fragment.id);
  const declaration: PropertyDeclaration = {
    id: context.declarationId++,
    name: readFormattedPointerSegment(path, -1) ?? '',
    path,
    schemaPath: input.schemaPath,
    schema: input.schema,
    fragmentId: fragment.id,
    role: input.role,
    scope: input.isFragment ? 'fragment' : 'node',
    isValidationOnly: false,
    context: input.context,
    gates: fragment.gates.slice(),
    order: fragment.order.slice(),
    isInherited: input.isInherited,
    hostPath: input.hostPath,
  };
  if (schema.controls?.fields !== undefined) context.hasChildTargets = true;
  if (process.env.NODE_ENV !== 'production') {
    Object.freeze(fragment.order);
    Object.freeze(fragment.gates);
    Object.freeze(declaration.order);
    Object.freeze(declaration.gates);
    Object.freeze(declaration);
  }
  fragment[input.role === 'declaration' ? 'declares' : 'overlays'].push(
    declaration.id,
  );
  if (input.isInherited) fragment.inheritedOverlays.push(declaration.id);
  result.push(declaration);
  const owner = ownerId ?? declaration.id;
  if (!context.capabilities.isBranchless) {
    const owners: DeclarationOwners = (context.declarationOwners ??= new Map());
    owners.set(declaration.id, owner);
  }
  const discriminators =
    schema.controls?.discriminator === undefined
      ? undefined
      : readDiscriminatorBranches(context, input.schema, input.schemaPath);
  if (discriminators?.size) {
    context.discriminatorBranches ??= new Set();
    for (const branchPath of discriminators.keys())
      context.discriminatorBranches.add(branchPath);
  }
  if (
    typeof schema.$ref !== 'string' &&
    schema.allOf === undefined &&
    schema.if === undefined &&
    schema.oneOf === undefined &&
    schema.anyOf === undefined
  )
    return result;
  const stack = [...visiting, input.schemaPath];
  if (typeof schema.$ref === 'string') {
    const target =
      referenceTarget ??
      resolveReference(context, schema.$ref, input.schemaPath);
    collectDeclarations(
      context,
      {
        ...input,
        ...target,
        gates,
        fragment,
        role: 'overlay',
        isInherited: true,
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
      const childPath =
        keyword === 'then' || keyword === 'else'
          ? appendSegment(input.schemaPath, keyword)
          : appendSegment(appendSegment(input.schemaPath, keyword), index);
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
            schemaPath: appendSegment(input.schemaPath, 'if'),
            hostPath: path,
            condition: schema.if,
            isNegated: keyword === 'else',
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
          isInherited: input.isInherited,
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
