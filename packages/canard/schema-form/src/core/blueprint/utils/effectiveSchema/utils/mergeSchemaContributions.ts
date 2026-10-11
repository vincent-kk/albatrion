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
import { freezeEffectiveSchema } from './freezeEffectiveSchema';
import { mergeSingleStaticContribution } from './mergeSchemaContributions/utils/mergeSingleStaticContribution';
import type { EffectiveSchemaState } from './type';

/**
 * Fold a selected authored sequence into a fresh renderer-hint object.
 * @param node - Stable static type and nullable metadata.
 * @param declarations - Applicable contributions already in total order.
 * @param options - Error collection and atomic group-merge policy.
 * @returns Owned result envelope, frozen in development; a contributing false schema forbids values.
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The array predicate does not narrow readonly arrays.
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
  for (let index = 0; index < declarations.length; index++) {
    const declaration = declarations[index];
    if (declaration.schema === false)
      return freezeEffectiveSchema({ schema: false, typeConflict: false });
    if (declaration.schema === true) continue;
    applySchemaContribution(state, declaration, options);
  }
  return finalizeEffectiveSchema(state, node);
};
