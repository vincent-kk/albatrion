import {
  readFieldNodeValidationEpoch,
  scheduleValidationSlot,
  startFieldNodeLoadValidation,
} from '@/schema-form/core';

import type { RootLoad, RootLoadStore } from '../type';
import { validateLoadRoot } from './validateLoadRoot';

/** Schedule the common engine load entry after the next frame.
 * @param load - Prepared load whose latest generation runs even while effects are disconnected.
 * @param store - Provider-owned current load identity across replacements.
 * @returns Nothing; stale load identities and superseded same-load tokens are dropped. */
export const scheduleLoadValidation = (
  load: RootLoad,
  store: RootLoadStore,
): void => {
  const root = load.root;
  if (!root) return;
  const epoch = readFieldNodeValidationEpoch(root);
  const token = (load.loadValidation = {});
  scheduleValidationSlot(() => {
    if (
      store.load !== load ||
      load.root !== root ||
      load.loadValidation !== token ||
      readFieldNodeValidationEpoch(root) !== epoch
    )
      return;
    if (startFieldNodeLoadValidation(root)) validateLoadRoot(root, load);
  });
};
