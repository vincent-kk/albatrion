import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../type';
import { evictValidationRoot } from './evictValidationRoot';
import { recentReleaseList } from './recentReleaseList';

/**
 * Release one committed consumer, retaining eight zero-consumer roots for reuse.
 * @param validator - Instance whose registrations are reference counted.
 * @param authoredRoot - Original root whose committed consumer was cleaned up.
 * @returns Nothing; the oldest zero-consumer registration may be evicted.
 */
export const releaseValidationRoot = (validator: Validator,
  authoredRoot: BlueprintSchema): void => {
  const list = recentReleaseList(validator);
  const count = list.counts.get(authoredRoot);
  if (!count || count <= 0) return;
  list.counts.set(authoredRoot, count - 1);
  if (count > 1) return;
  list.recent.push(authoredRoot);
  if (list.recent.length > 8) evictValidationRoot(validator, list.recent[0]);
};
