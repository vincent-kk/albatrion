import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../type';
import { validationEntries } from '../cache/validationEntries';
import { recentReleaseList } from './recentReleaseList';

/**
 * Release a zero-consumer registration and its core compilation cache together.
 * @param validator - Instance that owns the plugin registration.
 * @param authoredRoot - Zero-consumer authored root leaving the recent list.
 * @returns Nothing; later use recompiles a new copy.
 */
export const evictValidationRoot = (validator: Validator,
  authoredRoot: BlueprintSchema): void => {
  const list = recentReleaseList(validator);
  if ((list.counts.get(authoredRoot) ?? 0) > 0) return;
  const index = list.recent.indexOf(authoredRoot);
  if (index >= 0) list.recent.splice(index, 1);
  list.counts.delete(authoredRoot);
  try { validator.release?.(authoredRoot); }
  finally {
    if (typeof authoredRoot === 'object' && authoredRoot !== null)
      validationEntries.get(validator)?.delete(authoredRoot);
  }
};
