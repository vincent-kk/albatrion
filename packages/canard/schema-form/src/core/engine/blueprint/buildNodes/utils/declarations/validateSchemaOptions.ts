import { isPlainObject } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { isStringList } from './isStringList';

/** Boolean options share one shallow authoring contract. */
const BOOLEAN_OPTION_KEYS = ['terminal', 'omitEmpty', 'omitTrailing', 'trim'];

/**
 * Validate owned option values while leaving consumer extensions opaque.
 * @param context - Diagnostic collector for this analysis
 * @param options - Authored payload; only plain objects supply engine options
 * @param schemaPath - Authored position that owns the options group
 * @returns Nothing; malformed reserved values throw at their exact option key
 */
export const validateSchemaOptions = (
  context: AnalysisContext,
  options: unknown,
  schemaPath: string,
): void => {
  if (!isPlainObject(options)) return;
  for (const key of BOOLEAN_OPTION_KEYS)
    if (options[key] !== undefined && typeof options[key] !== 'boolean')
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        appendSegment(appendSegment(schemaPath, 'options'), key),
        { group: 'options', key, expected: 'boolean' },
        context.options,
      );
  if (
    options.propertyOrder !== undefined &&
    !isStringList(options.propertyOrder)
  )
    throwBlueprintError(
      FormErrorCode.InvalidControlShape,
      appendSegment(appendSegment(schemaPath, 'options'), 'propertyOrder'),
      { group: 'options', key: 'propertyOrder', expected: 'string[]' },
      context.options,
    );
};
