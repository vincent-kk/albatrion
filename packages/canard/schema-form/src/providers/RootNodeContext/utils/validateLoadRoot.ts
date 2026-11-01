import type { FieldNode } from '@/schema-form/core';

import type { RootLoad } from '../type';
import { reportLoadValidationFailure } from './reportLoadValidationFailure';

/** Start the load verdict without recapturing an engine-reported failure.
 * @param root - Current committed root.
 * @param load - Load captured by the slot; replacement retirement suppresses its late host report.
 * @returns Nothing; a non-retired load's rejection reaches the host in order. */
export const validateLoadRoot = (root: FieldNode, load: RootLoad): void => {
  void root.validate().catch((failure: unknown) => {
    if (!load.retired) reportLoadValidationFailure(failure);
  });
};
