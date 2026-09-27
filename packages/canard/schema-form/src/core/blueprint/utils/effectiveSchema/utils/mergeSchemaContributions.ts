import type {
  BlueprintNode,
  BlueprintSchema,
  EffectiveSchemaOptions,
  PropertyDeclaration,
  SchemaTypeName,
} from '../../../type';
import { applySchemaContribution } from './applySchemaContribution';
import { finalizeEffectiveSchema } from './finalizeEffectiveSchema';
import type { EffectiveSchemaState } from './type';

/**
 * Fold a selected authored sequence into a fresh renderer-hint object.
 * @param node - Stable static type and nullable metadata.
 * @param declarations - Applicable contributions already in total order.
 * @param options - Error collection and atomic group-merge policy.
 * @returns Frozen outer hints, or false when a contributing boolean schema forbids values.
 */
export const mergeSchemaContributions = (
  node: BlueprintNode,
  declarations: readonly PropertyDeclaration[],
  options: EffectiveSchemaOptions,
): BlueprintSchema => {
  const staticTypes =
    node.schemaType === 'virtual'
      ? undefined
      : ((Array.isArray(node.schemaType)
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
    if (declaration.schema === false) return false;
    if (declaration.schema === true) continue;
    applySchemaContribution(state, declaration, options);
  }
  return finalizeEffectiveSchema(state, node);
};
