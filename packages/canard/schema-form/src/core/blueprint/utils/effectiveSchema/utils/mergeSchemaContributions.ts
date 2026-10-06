import { isArray } from '@winglet/common-utils/filter';

import type {
  BlueprintNode,
  EffectiveSchema,
  EffectiveSchemaOptions,
  PropertyDeclaration,
  SchemaTypeName,
} from '../../../type';
import { applySchemaContribution } from './applySchemaContribution';
import { finalizeEffectiveSchema } from './finalizeEffectiveSchema';
import { mergeSingleStaticContribution } from './mergeSchemaContributions/utils/mergeSingleStaticContribution';
import type { EffectiveSchemaState } from './type';

/** Shared result of a contributing `false` schema, so the early return allocates nothing. */
const FALSE_EFFECTIVE_SCHEMA: EffectiveSchema = Object.freeze({
  schema: false,
  typeConflict: false,
});

/**
 * Fold a selected authored sequence into a fresh renderer-hint object.
 * @param node - Stable static type and nullable metadata.
 * @param declarations - Applicable contributions already in total order.
 * @param options - Error collection and atomic group-merge policy.
 * @returns Frozen result record; its schema is false when a contributing boolean schema forbids values.
 */
export const mergeSchemaContributions = (
  node: BlueprintNode,
  declarations: readonly PropertyDeclaration[],
  options: EffectiveSchemaOptions,
): EffectiveSchema => {
  const single = mergeSingleStaticContribution(node, declarations, options);
  if (single !== undefined) return single;
  const staticTypes =
    node.schemaType === 'virtual'
      ? undefined
      : ((isArray(node.schemaType)
          ? node.schemaType
          : [node.schemaType]) as readonly SchemaTypeName[]);
  const state: EffectiveSchemaState = {
    schema: {},
    patterns: [],
    conflictingConst: false,
    conflictingType: false,
    allowedTypes:
      staticTypes && node.nullable && !staticTypes.includes('null')
        ? [...staticTypes, 'null']
        : staticTypes,
  };
  for (const declaration of declarations) {
    if (declaration.schema === false) return FALSE_EFFECTIVE_SCHEMA;
    if (declaration.schema === true) continue;
    applySchemaContribution(state, declaration, options);
  }
  return finalizeEffectiveSchema(state, node);
};
