import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { evictValidationRoot } from './evictValidationRoot';
import { recentReleaseList } from './recentReleaseList';

/** Release other zero-consumer registrations before a same-id compile or retry.
 * @param validator - Selected instance whose plugin registrations share ids.
 * @param authoredRoot - Current root, excluded from eviction; only string ids participate.
 * @returns Nothing; same-id eviction intentionally ignores in-flight pins. */
export const evictSameIdRoots = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): void => {
  if (
    typeof authoredRoot !== 'object' ||
    authoredRoot === null ||
    typeof authoredRoot.$id !== 'string'
  )
    return;
  for (const oldRoot of [...recentReleaseList(validator).recent])
    if (
      oldRoot !== authoredRoot &&
      typeof oldRoot === 'object' &&
      oldRoot !== null &&
      oldRoot.$id === authoredRoot.$id
    )
      evictValidationRoot(validator, oldRoot);
};
