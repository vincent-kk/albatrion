import { FormErrorCode } from '../../../../../../errors';
import type { EffectiveSchemaOptions } from '../../../types/effectiveSchema';
import type { BlueprintSchema } from '../../../types/schema';
import { intersectAllowedTypes } from '../../../utils/allowedTypes/intersectAllowedTypes';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import type { EffectiveSchemaState } from '../../types/state';

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
      FormErrorCode.AllOfTypeRedefinition,
      schemaPath,
      {
        guidance: 'Static type declarations must have a nonempty intersection.',
      },
      options,
    );
  state.conflictingType = true;
};
