import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { recentReleaseList } from './recentReleaseList';

/** Protect one run's authored root from LRU overflow without retaining a consumer.
 * @param validator - Selected validator owning the shared lifetime ledger.
 * @param authoredRoot - Root captured before checking its compiled entry.
 * @returns Nothing; the matching unpin must run even when compilation throws. */
export const pinValidationRoot = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): void => {
  const inflight = recentReleaseList(validator).inflight;
  inflight.set(authoredRoot, (inflight.get(authoredRoot) ?? 0) + 1);
};
