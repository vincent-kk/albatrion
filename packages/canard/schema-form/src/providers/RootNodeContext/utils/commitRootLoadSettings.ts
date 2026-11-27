import { ValidationMode, updateFieldNodeSettings } from '@/schema-form/core';

import type { RootLoad, RootLoadProps, RootLoadStore } from '../type';
import { scheduleLoadValidation } from './scheduleLoadValidation';

/**
 * Commit the current root's scalar settings before context and external errors.
 * @param load - Current prepared or newly committed load; replaced loads are ignored.
 * @param store - Provider store that owns the single valid scheduling token.
 * @param props - Latest committed scalar defaults, independent of construction props.
 * @param policy - Opaque resolved display policy committed in the same transition.
 * @returns Nothing; effective mode changes replace the shared load/activation slot.
 */
export const commitRootLoadSettings = (
  load: RootLoad,
  store: RootLoadStore,
  props: RootLoadProps,
  policy: unknown,
): void => {
  const root = load.root;
  if (!root || store.load !== load) return;
  updateFieldNodeSettings(
    root,
    {
      validationMode: props.validationMode,
      unsetOnInactive: props.unsetOnInactive,
      disableAutomaticWrites: props.disableAutomaticWrites,
      errorVisibility: policy,
    },
    () => {
      if (store.load !== load || load.root !== root) return;
      load.loadValidation = undefined;
      if (props.validationMode !== ValidationMode.None)
        scheduleLoadValidation(load, store);
    },
  );
};
