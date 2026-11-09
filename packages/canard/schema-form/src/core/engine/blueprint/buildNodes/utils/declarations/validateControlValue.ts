import {
  RESERVED_SCHEMA_KEYS,
  SCHEMA_GROUP,
} from '@/schema-form/constants/reservedSchemaKeys';
import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { matchesReservedShallowType } from './matchesReservedShallowType';

/**
 * Validate reserved scalar controls without evaluating expressions or literal data.
 * @param context - Diagnostic collector for this analysis
 * @param key - Control name already accepted for the declaration scope
 * @param value - Authored value; undefined means absent
 * @param schemaPath - Authored position that owns the controls group
 * @returns Nothing; invalid values throw at their exact control key
 */
export const validateControlValue = (
  context: AnalysisContext,
  key: keyof typeof RESERVED_SCHEMA_KEYS.controls,
  value: unknown,
  schemaPath: string,
): void => {
  if (value === undefined) return;
  const expected = RESERVED_SCHEMA_KEYS.controls[key].shallow;
  if (!matchesReservedShallowType(value, expected))
    throwBlueprintError(
      FormErrorCode.InvalidControlShape,
      appendSegment(appendSegment(schemaPath, SCHEMA_GROUP.controls), key),
      { group: SCHEMA_GROUP.controls, key, expected },
      context.options,
    );
};
