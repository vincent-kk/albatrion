import type { Validator } from '../../types/validator';
import { evictValidationRoot } from './evictValidationRoot';
import { recentReleaseList } from './recentReleaseList';

/** Trim recent overflow in release order while preserving every in-flight root.
 * @param validator - Owner of the recent queue and plugin registrations.
 * @returns Nothing; overflow remains when every candidate is pinned. */
export const evictRecentValidationRoots = (validator: Validator): void => {
  const list = recentReleaseList(validator);
  while (list.recent.length > 8) {
    const oldest = list.recent.find((root) => !list.inflight.has(root));
    if (oldest === undefined) return;
    evictValidationRoot(validator, oldest);
  }
};
