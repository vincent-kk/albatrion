import type { BlueprintSchema, EffectiveSchemaOptions } from '../../../type';
import { BlueprintErrorCode } from '../../diagnostics/constant';
import { throwBlueprintError } from '../../diagnostics/throwBlueprintError';
import { intersectAllowedTypes } from '../../types/intersectAllowedTypes';
import { readAllowedTypes } from '../../types/readAllowedTypes';
import type { EffectiveSchemaState } from './type';

/**
 * Intersect a declaration's accepted types without classifying runtime conflicts.
 * @param state - Private accumulation state carrying the static type anchor.
 * @param schema - Current authored schema; missing type leaves the anchor intact.
 * @param schemaPath - Location used for static type-conflict diagnostics.
 * @param options - Static/runtime error policy and collector.
 * @returns Nothing; runtime emptiness is recorded for later hint serialization.
 */
export const applyTypeContribution = (
  state: EffectiveSchemaState,
  schema: BlueprintSchema,
  schemaPath: string,
  options: EffectiveSchemaOptions,
): void => {
  if (!state.allowedTypes) return;
  state.allowedTypes = intersectAllowedTypes(
    state.allowedTypes,
    readAllowedTypes(schema, schemaPath, options),
  );
  if (state.allowedTypes?.length !== 0) return;
  if (options.mode === 'static')
    throwBlueprintError(
      BlueprintErrorCode.AllOfTypeRedefinition,
      schemaPath,
      {
        guidance: 'Static type declarations must have a nonempty intersection.',
      },
      options,
    );
  state.conflictingType = true;
};
