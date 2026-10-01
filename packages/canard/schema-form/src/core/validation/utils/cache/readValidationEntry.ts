import type { BlueprintSchema } from '../../../blueprint';
import type { GuardFunction, ValidateFunction, Validator } from '../../type';
import { createValidatorCopy } from '../copy/createValidatorCopy';

/** Successful or failed compilation retained under one authored position. */
export type GuardResult = { readonly guard: GuardFunction; readonly failure?: never } |
  { readonly failure: unknown; readonly guard?: never };

/** One validator/root cache entry shared by every consuming tree. */
export interface ValidationEntry {
  /** Deep copy given to whole-schema compilation. */
  readonly copy: BlueprintSchema;
  /** Authored-position guard compilation outcomes, including failures. */
  readonly guards: Map<string, GuardResult>;
  /** Whole-schema compilation result when successful. */
  readonly validate?: ValidateFunction;
  /** Whole-schema compilation failure when it throws. */
  readonly failure?: unknown;
  /** Whether development guard precompilation has already run. */
  eagerCompiled: boolean;
}

/** Cache owners remain independent even when their authored roots match. */
const entries = new WeakMap<Validator, WeakMap<object, ValidationEntry>>();

/**
 * Read or create the single copied and compiled entry for this validator/root pair.
 * @param validator - Selected instance; its identity owns an independent cache.
 * @param authoredRoot - Authored schema object retained by the form tree.
 * @returns The shared entry, including a cached compilation failure.
 */
export const readValidationEntry = (
  validator: Validator, authoredRoot: BlueprintSchema,
): ValidationEntry => {
  let roots = entries.get(validator);
  if (!roots) {
    roots = new WeakMap();
    entries.set(validator, roots);
  }
  if (typeof authoredRoot !== 'object' || authoredRoot === null)
    throw new TypeError('Validation cache requires an authored root object');
  const existing = roots.get(authoredRoot);
  if (existing) return existing;
  const copy = createValidatorCopy(authoredRoot);
  let validate: ValidateFunction | undefined;
  let failure: unknown;
  try { validate = validator.compile(copy); }
  catch (error) { failure = error; }
  const entry: ValidationEntry = { copy, guards: new Map(), validate, failure,
    eagerCompiled: false };
  roots.set(authoredRoot, entry);
  return entry;
};
