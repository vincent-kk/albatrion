import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../../../errors';
import type { BlueprintDiagnostic } from '../../types/blueprint';

/**
 * Collect incompatible exit controls only for the requested diagnostic consumer.
 * @param controls - Authored controls at one declaration or fields layer
 * @param schemaPath - Authored schema position owning this controls object
 * @param emit - Owner's location-deduplicating diagnostic sink
 * @returns Nothing; literal clear conflicts are warnings rather than schema errors
 */
export const collectInactiveValueWarnings = (
  controls: unknown,
  schemaPath: string,
  emit: (diagnostic: BlueprintDiagnostic) => void,
): void => {
  if (!controls || typeof controls !== 'object' || isArray(controls)) return;
  if (
    hasOwnProperty(controls, 'inactiveValue') &&
    Reflect.get(controls, 'unsetOnInactive') === true
  )
    emit({
      code: FormWarningCode.InactiveValueWithUnsetOnInactive,
      level: 'warning',
      schemaPath: appendSegment(schemaPath, 'controls'),
      details: {},
    });
  const fields: unknown = Reflect.get(controls, 'fields');
  if (!isArray(fields)) return;
  for (let index = 0; index < fields.length; index++) {
    const field: unknown = fields[index];
    if (!field || typeof field !== 'object') continue;
    collectInactiveValueWarnings(
      Reflect.get(field, 'controls'),
      appendSegment(appendSegment(appendSegment(schemaPath, 'controls'), 'fields'), index),
      emit,
    );
  }
};
