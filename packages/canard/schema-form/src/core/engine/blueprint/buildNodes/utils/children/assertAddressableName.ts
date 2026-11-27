import {
  appendSegment,
  isReservedPercentName,
} from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';

/**
 * Reject an object property whose path would read back as a reserved operator name.
 * @param context - Root-local analysis state carrying the diagnostic consumer.
 * @param declarationSchemaPath - Authored location of the schema that declares `properties`.
 * @param name - Property name as authored; any string is valid input.
 * @returns Nothing when the name is addressable.
 * @throws A `FormErrorCode.ReservedPropertyName` schema error naming the property and the rule when the name is exactly `%2A`, `%2E`, `%2E%2E` or `%40`.
 */
export const assertAddressableName = (
  context: AnalysisContext,
  declarationSchemaPath: string,
  name: string,
): void => {
  if (!isReservedPercentName(name)) return;
  throwBlueprintError(
    FormErrorCode.ReservedPropertyName,
    appendSegment(appendSegment(declarationSchemaPath, 'properties'), name),
    {
      property: name,
      guidance: `Property name "${name}" is not supported: its path reads back as a reserved operator name. Rename the property.`,
    },
    context.options,
  );
};
