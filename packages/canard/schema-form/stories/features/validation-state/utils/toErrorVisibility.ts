import type { ErrorVisibilityName } from '@aileron/schema-form-scenarios';

import { ErrorVisibility } from '../../../../src';

/**
 * Map a scenario display policy name to the public string policy.
 * @param name - Policy named by a validation-state case constant.
 * @returns The ErrorVisibility value passed as the errorVisibility prop.
 */
export function toErrorVisibility(name: ErrorVisibilityName): ErrorVisibility {
  return ErrorVisibility[name];
}
