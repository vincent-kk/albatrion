import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { isStringList } from './isStringList';

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
  key: string,
  value: unknown,
  schemaPath: string,
): void => {
  if (value === undefined) return;
  let expected: string | undefined;
  switch (key) {
    case 'active':
    case 'visible':
    case 'readOnly':
    case 'disabled':
    case 'unsetValue':
    case 'resetInteraction':
    case 'unsetOnInactive':
      if (typeof value !== 'boolean' && typeof value !== 'string')
        expected = 'boolean | string';
      break;
    case 'derived':
      if (typeof value !== 'string') expected = 'string';
      break;
    case 'watch':
      if (typeof value !== 'string' && !isStringList(value))
        expected = 'string | string[]';
  }
  if (expected)
    throwBlueprintError(
      FormErrorCode.InvalidControlShape,
      appendSegment(appendSegment(schemaPath, 'controls'), key),
      { group: 'controls', key, expected },
      context.options,
    );
};
