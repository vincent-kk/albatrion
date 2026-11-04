import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type {
  EffectiveSchema,
  EffectiveSchemaOptions,
} from '../../../types/effectiveSchema';
import type { BlueprintNode, PropertyDeclaration } from '../../../types/node';
import type { SchemaTypeName } from '../../../types/schema';
import type { EffectiveSchemaState } from '../../types/state';
import { applySchemaContribution } from '../apply/applySchemaContribution';
import { finalizeEffectiveSchema } from '../finalize/finalizeEffectiveSchema';
import { freezeEffectiveSchema } from '../finalize/freezeEffectiveSchema';
import { mergeSingleStaticContribution } from './mergeSingleStaticContribution';

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
  const staticTypes: Optional<readonly SchemaTypeName[]> =
    node.schemaType === undefined
      ? undefined
      : isArray(node.schemaType)
        ? node.schemaType
        : [node.schemaType];
  const state: EffectiveSchemaState = {
    schema: {},
    patterns: [],
    conflictingConst: false,
    conflictingType: false,
    allowedTypes:
      staticTypes && node.nullable && staticTypes.indexOf('null') === -1
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
