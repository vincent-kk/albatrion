import type { FieldNode } from '@/schema-form/core';

import { reportMountValidationFailure } from './reportMountValidationFailure';

/** Start the mount verdict without recapturing an engine-reported failure.
 * @param root - Current committed root.
 * @returns Nothing; only bundled consumer failures reach the host from this helper. */
export const validateMountRoot = (root: FieldNode): void => {
  void root.validate().catch(reportMountValidationFailure);
};
