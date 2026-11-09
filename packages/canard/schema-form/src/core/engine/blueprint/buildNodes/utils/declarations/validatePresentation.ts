import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';

/** Reserved binding values are checked shallowly without a React dependency. */
const PRESENTATION_KEYS = [
  'inputType',
  'FieldInput',
  'FieldInputProps',
  'FieldRendererProps',
  'errorMessages',
];

/**
 * Check reserved presentation envelopes without inspecting their nested payloads.
 * @param context - Diagnostic collector for this analysis
 * @param presentation - Opaque authored group with optional reserved values
 * @param schemaPath - Authored position that owns the presentation group
 * @returns Nothing; invalid reserved values throw at their exact key
 */
export const validatePresentation = (
  context: AnalysisContext,
  presentation: unknown,
  schemaPath: string,
): void => {
  if (!presentation || typeof presentation !== 'object') return;
  for (const key of PRESENTATION_KEYS) {
    if (!(key in presentation)) continue;
    const value: unknown = Reflect.get(presentation, key);
    if (value === undefined) continue;
    let expected: string | undefined;
    if (key === 'inputType') {
      if (typeof value !== 'string') expected = 'string';
    } else if (key === 'FieldInput') {
      if (
        value !== null &&
        typeof value !== 'function' &&
        typeof value !== 'object'
      )
        expected = 'function | object | null';
    } else if (!value || typeof value !== 'object' || isArray(value)) {
      expected = 'object';
    }
    if (expected)
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        appendSegment(appendSegment(schemaPath, 'presentation'), key),
        { group: 'presentation', key, expected },
        context.options,
      );
  }
};
