import {
  hasFieldNodeValidationRequest,
  scheduleValidationSlot,
} from '@/schema-form/core';

import type { RootLoad, RootLoadStore } from '../type';
import { validateMountRoot } from './validateMountRoot';

/**
 * Schedule a committed load's first OnChange verdict after its initial frame.
 * @param load - Preserved load whose layout lifetime decides whether validation is owed.
 * @param store - Provider-owned identity of the current load across root replacements.
 * @returns Nothing; compile failures are reported once by the engine itself.
 */
export const scheduleMountValidation = (
  load: RootLoad,
  store: RootLoadStore,
): void => {
  scheduleValidationSlot(() => {
    if (store.load !== load) return;
    const root = load.root;
    if (!root) return;
    if (hasFieldNodeValidationRequest(root)) return;
    if (!load.ready) {
      load.mountValidationOwed = true;
      return;
    }
    validateMountRoot(root);
  });
};
