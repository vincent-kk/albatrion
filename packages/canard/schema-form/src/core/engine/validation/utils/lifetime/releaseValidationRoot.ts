import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { evictRecentValidationRoots } from './evictRecentValidationRoots';
import { recentReleaseList } from './recentReleaseList';

/**
 * Release one committed consumer, retaining recent zero-consumer roots for reuse.
 * @param validator - Instance whose registrations are reference counted.
 * @param authoredRoot - Original root whose committed consumer was cleaned up.
 * @returns Nothing; oldest unpinned registrations are evicted above eight, with pinned overflow retained.
 */
export const releaseValidationRoot = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): void => {
  const list = recentReleaseList(validator);
  const count = list.counts.get(authoredRoot);
  if (!count || count <= 0) return;
  list.counts.set(authoredRoot, count - 1);
  if (count > 1) return;
  list.recent.push(authoredRoot);
  evictRecentValidationRoots(validator);
};
