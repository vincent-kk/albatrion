import type { FieldNode } from '@/schema-form/core';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';

/** Start the mount verdict with its shared rejection filter.
 * @param root - Current committed root.
 * @param reporter - Instance service for failures not already reported by the engine.
 * @returns Nothing; the engine owns the asynchronous verdict. */
export const validateMountRoot = (
  root: FieldNode,
  reporter?: FormErrorService,
): void => {
  void root.validate().catch((error) => {
    if (
      error instanceof SchemaFormError &&
      error.code === FormErrorCode.ValidatorCompileFailed
    )
      return;
    reporter?.capture(error, undefined, 'rejected');
  });
};
