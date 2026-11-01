import type { FieldNode } from '@/schema-form/core';

import { reportLoadValidationFailure } from './reportLoadValidationFailure';

/** Start the load verdict without recapturing an engine-reported failure.
 * @param root - Current committed root.
 * @returns Nothing; only bundled consumer failures reach the host from this helper. */
export const validateLoadRoot = (root: FieldNode): void => {
  void root.validate().catch(reportLoadValidationFailure);
};
