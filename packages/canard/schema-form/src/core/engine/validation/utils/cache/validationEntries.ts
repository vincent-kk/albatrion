import type { ValidationEntry } from '../../types/validationEntry';
import type { Validator } from '../../types/validator';

/** Validator-owned cache rows, keyed by the original authored root. */
export const validationEntries = new WeakMap<
  Validator,
  WeakMap<object, ValidationEntry>
>();
