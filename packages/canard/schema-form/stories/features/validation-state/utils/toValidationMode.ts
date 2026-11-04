import type { ValidationModeName } from '@aileron/schema-form-scenarios';

import { ValidationMode } from '../../../../src';

const MODES: Readonly<Record<ValidationModeName, ValidationMode>> = {
  OnChange: ValidationMode.OnChange, OnRequest: ValidationMode.OnRequest, None: ValidationMode.None,
};

/**
 * Map a scenario validation mode name to the engine flag.
 * @param name - Mode named by a validation-state case constant.
 * @returns The ValidationMode flag passed as the validationMode prop.
 */
export function toValidationMode(name: ValidationModeName): ValidationMode {
  return MODES[name];
}
