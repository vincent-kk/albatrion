import type { FieldNode } from '@/schema-form/core';

import { reportLoadValidationFailure } from './reportLoadValidationFailure';

/** Start the load verdict without recapturing an engine-reported failure.
 * @param root - Current committed root.
 * @returns Nothing; the verdict rejection and bundled consumer failures reach the host in order. */
export const validateLoadRoot = (root: FieldNode): void => {
  void root.validate().catch(reportLoadValidationFailure);
};
