import { forEachFailureLeaf } from './forEachFailureLeaf';
import { reportOwnerlessError } from './reportOwnerlessError';

/** Send an unowned engine failure to its existing sink one leaf at a time.
 * @param failure - Original failure or completed bundle.
 * @returns Nothing; sink order and original leaf identities are preserved. */
export const reportOwnerlessFailure = (failure: unknown): void => {
  forEachFailureLeaf(failure, reportOwnerlessError);
};
