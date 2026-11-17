import { forEachFailureLeaf } from '@/schema-form/core';

import { reportErrorToHost } from './reportErrorToHost';

/** Send an unowned binding failure through the existing host channel per leaf.
 * @param failure - Original failure or completed bundle.
 * @returns Nothing; malformed and revisited bundles are reported as themselves. */
export const reportFailureToHost = (failure: unknown): void => {
  forEachFailureLeaf(failure, reportErrorToHost);
};
