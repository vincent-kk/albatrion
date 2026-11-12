import type { BlueprintSchema } from '../../../blueprint';
import type { ValidationEntry } from '../../types/validationEntry';
import type { Validator } from '../../types/validator';
import { createValidatorCopy } from '../copy/createValidatorCopy';
import { evictRecentValidationRoots } from '../lifetime/evictRecentValidationRoots';
import { evictSameIdRoots } from '../lifetime/evictSameIdRoots';
import { recentReleaseList } from '../lifetime/recentReleaseList';
import { validationEntries } from './validationEntries';

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
