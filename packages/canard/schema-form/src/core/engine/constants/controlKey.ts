import type { ControlKey } from '../types/controls';

/** Names of the node `controls` keys; the type ties the set to `ControlKey` in both directions. */
export const CONTROL_KEY = {
  active: 'active',
  visible: 'visible',
  readOnly: 'readOnly',
  disabled: 'disabled',
  default: 'default',
  derived: 'derived',
  unsetValue: 'unsetValue',
  resetInteraction: 'resetInteraction',
  unsetOnInactive: 'unsetOnInactive',
  inactiveValue: 'inactiveValue',
  fields: 'fields',
  injectTo: 'injectTo',
  discriminator: 'discriminator',
  watch: 'watch',
} as const satisfies { readonly [Key in ControlKey]: Key };
