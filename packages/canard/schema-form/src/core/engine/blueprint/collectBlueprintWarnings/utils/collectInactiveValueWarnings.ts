import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../../../errors';
import { CONTROL_KEY } from '../../../constants/controlKey';
import type { ValidatedControls } from '../../../utils/controls/readValidatedControls';
import type { BlueprintDiagnostic } from '../../types/blueprint';

/**
 * Collect incompatible exit controls only for the requested diagnostic consumer.
 * @param controls - Authored controls at one declaration or fields layer
 * @param schemaPath - Authored schema position owning this controls object
 * @param emit - Owner's location-deduplicating diagnostic sink
 * @returns Nothing; literal clear conflicts are warnings rather than schema errors
 */
export const collectInactiveValueWarnings = (
  controls: ValidatedControls | undefined,
  schemaPath: string,
  emit: (diagnostic: BlueprintDiagnostic) => void,
): void => {
  if (!controls) return;
  if (
    hasOwnProperty(controls, CONTROL_KEY.inactiveValue) &&
    Reflect.get(controls, 'unsetOnInactive') === true
  )
    emit({
      code: FormWarningCode.InactiveValueWithUnsetOnInactive,
      level: 'warning',
      schemaPath: appendSegment(schemaPath, 'controls'),
      details: {},
    });
  const fields = controls.fields;
  if (!fields) return;
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    if (!field) continue;
    collectInactiveValueWarnings(
      field.controls,
      appendSegment(
        appendSegment(appendSegment(schemaPath, 'controls'), 'fields'),
        index,
      ),
      emit,
    );
  }
};
