import {
  RESERVED_PRESENTATION_KEYS,
  RESERVED_SCHEMA_KEYS,
  SCHEMA_GROUP,
} from '@/schema-form/constants/reservedSchemaKeys';
import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { matchesReservedShallowType } from './matchesReservedShallowType';

/**
 * Validate reserved presentation envelopes while keeping extension payloads opaque.
 * @param context - Invocation-owned diagnostic collector.
 * @param value - Authored group before shallow validation.
 * @param schemaPath - Original position owning the group.
 * @returns Nothing; invalid reserved values throw at their exact authored key.
 */
export const validatePresentation = (
  context: AnalysisContext,
  value: unknown,
  schemaPath: string,
): void => {
  if (!value || typeof value !== 'object') return;
  for (const key of RESERVED_PRESENTATION_KEYS) {
    const item: unknown = Reflect.get(value, key);
    if (item === undefined) continue;
    const expected = RESERVED_SCHEMA_KEYS.presentation[key].shallow;
    if (!matchesReservedShallowType(item, expected))
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        appendSegment(
          appendSegment(schemaPath, SCHEMA_GROUP.presentation),
          key,
        ),
        { group: SCHEMA_GROUP.presentation, key, expected },
        context.options,
      );
  }
};
