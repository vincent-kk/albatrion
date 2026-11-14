import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { recentReleaseList } from './recentReleaseList';

/** Finish one run without invoking plugin release or obscuring its outcome.
 * @param validator - Validator captured when the run began.
 * @param authoredRoot - Matching root whose last pin may refresh an existing release position.
 * @returns Nothing; zero pins are removed and overflow waits for the next eviction point. */
export const unpinValidationRoot = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): void => {
  const list = recentReleaseList(validator);
  const count = list.inflight.get(authoredRoot);
  if (!count) return;
  if (count > 1) {
    list.inflight.set(authoredRoot, count - 1);
    return;
  }
  list.inflight.delete(authoredRoot);
  const index = list.recent.indexOf(authoredRoot);
  if (index >= 0) {
    list.recent.splice(index, 1);
    list.recent.push(authoredRoot);
  }
};
