import type { SchemaFormError } from '../../../../../errors';
import type { BlueprintSchema } from '../../../blueprint';
import type {
  GuardFunction,
  ValidateFunction,
  Validator,
} from '../../types/validator';
import { createValidatorCopy } from '../copy/createValidatorCopy';
import { evictRecentValidationRoots } from '../lifetime/evictRecentValidationRoots';
import { evictSameIdRoots } from '../lifetime/evictSameIdRoots';
import { recentReleaseList } from '../lifetime/recentReleaseList';
import { validationEntries } from './validationEntries';

/** Successful or failed compilation retained under one authored position. */
export type GuardResult =
  | { readonly guard: GuardFunction; readonly failure?: never }
  | { readonly failure: unknown; readonly guard?: never };

/** One validator/root cache entry shared by every consuming tree. */
export interface ValidationEntry {
  /** Deep copy given to whole-schema compilation. */
  readonly copy: BlueprintSchema;
  /** Authored-position guard compilation outcomes, including failures. */
  readonly guards: Map<string, GuardResult>;
  /** Whether the first whole-schema compile has been attempted, including a thrown undefined. */
  compiled: boolean;
  /** Whole-schema compilation result when successful. */
  validate?: ValidateFunction;
  /** Whole-schema compilation failure when it throws. */
  failure?: unknown;
  /** Duplicate-id registration observed while this compilation failed. */
  duplicate?: boolean;
  /** Whether the one whole-schema retry after a retained-id collision has been consumed. */
  retried?: boolean;
  /** Shared compile rejection identity for automatic reports and later explicit/native requests. */
  rejection?: SchemaFormError;
  /** Whether development guard precompilation has already run. */
  eagerCompiled: boolean;
}

/**
 * Read or create the shared copy and guards without compiling the whole schema.
 * @param validator - Selected instance; its identity owns an independent cache.
 * @param authoredRoot - Authored schema object retained by the form tree.
 * @returns The shared entry; whole-schema compilation waits for explicit demand.
 */
export const readValidationEntry = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): ValidationEntry => {
  let roots = validationEntries.get(validator);
  if (!roots) {
    roots = new WeakMap();
    validationEntries.set(validator, roots);
  }
  if (typeof authoredRoot !== 'object' || authoredRoot === null)
    throw new TypeError('Validation cache requires an authored root object');
  const existing = roots.get(authoredRoot);
  if (existing) return existing;
  const list = recentReleaseList(validator);
  evictSameIdRoots(validator, authoredRoot);
  if (!list.counts.has(authoredRoot)) {
    list.counts.set(authoredRoot, 0);
    list.recent.push(authoredRoot);
    evictRecentValidationRoots(validator, authoredRoot);
  }
  const entry: ValidationEntry = {
    copy: createValidatorCopy(authoredRoot),
    guards: new Map(),
    compiled: false,
    eagerCompiled: false,
  };
  roots.set(authoredRoot, entry);
  return entry;
};
