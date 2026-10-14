import type { Validator } from '../../type';
import type { ValidationEntry } from './readValidationEntry';

/** Validator-owned cache rows, keyed by the original authored root. */
export const validationEntries = new WeakMap<Validator, WeakMap<object, ValidationEntry>>();
