import { scheduleValidationSlot } from '@/schema-form/core';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';
import type { RootLoad, RootLoadStore } from '../type';

/**
 * Schedule a committed load's first OnChange verdict after its initial frame.
 * @param load - Preserved load whose layout lifetime decides whether validation is owed.
 * @param store - Provider-owned identity of the current load across root replacements.
 * @param reporter - Instance service retaining the mount rejection surface.
 * @returns Nothing; compile failures are reported once by the engine itself.
 */
export const scheduleMountValidation = (
  load: RootLoad,
  store: RootLoadStore,
  reporter?: FormErrorService,
): void => {
  scheduleValidationSlot(() => {
    if (store.load !== load) return;
    const root = load.root;
    if (!root) return;
    if (!load.ready) {
      load.mountValidationOwed = true;
      return;
    }
    void root.validate().catch((error) => {
      if (
        error instanceof SchemaFormError &&
        error.code === FormErrorCode.ValidatorCompileFailed
      )
        return;
      reporter?.capture(error, undefined, 'rejected');
    });
  });
};
