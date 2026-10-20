import { printWarning } from '@winglet/common-utils/console';
import type { ErrorDetails } from '@winglet/common-utils/error';
import { isEmptyObject } from '@winglet/common-utils/filter';

import type { FormWarningCode } from '@/schema-form/errors';

/** Captures the build environment once for this module's development checks. */
const productionBuild = process.env.NODE_ENV === 'production';

export interface DevelopmentIssue {
  code: FormWarningCode;
  message: string;
  details?: ErrorDetails;
}

/** Development warnings already emitted in this session, keyed by code + message. */
const emittedWarnings = new Set<string>();

/**
 * Reports a development-only diagnostic using the shared
 * `code + formatted message + details` structure.
 *
 * @remarks
 * - Silent when the private module constant `productionBuild` is true. Its initializer
 *   keeps the bare NODE_ENV token so consumer bundlers can replace it and drop the branch.
 * - Deduplicated per session by `code + message`, so warnings raised from
 *   per-node pipelines (e.g. schema merging) cannot flood the console.
 * @param issue - The diagnostic to report, carrying code, message, and details
 */
export const warnDevelopmentIssue = (issue: DevelopmentIssue): void => {
  if (productionBuild) return;
  const signature = `${issue.code}\n${issue.message}`;
  if (emittedWarnings.has(signature)) return;
  emittedWarnings.add(signature);
  const details = issue.details ?? {};
  printWarning(
    `[@canard/schema-form] ${issue.code}`,
    issue.message.split('\n'),
    isEmptyObject(details) ? undefined : { details },
  );
};
