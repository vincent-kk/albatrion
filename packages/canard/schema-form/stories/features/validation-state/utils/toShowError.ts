import type { ShowErrorName } from '@aileron/schema-form-scenarios';

import { ShowError } from '../../../../src';

/**
 * Map a scenario display policy name to the engine flag.
 * @param name - Policy named by a validation-state case constant.
 * @returns The ShowError flag passed as the showError prop.
 */
export function toShowError(name: ShowErrorName): ShowError {
  return ShowError[name];
}
