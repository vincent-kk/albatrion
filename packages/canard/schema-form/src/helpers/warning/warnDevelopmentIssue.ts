import { printWarning } from '@winglet/common-utils/console';
import type { ErrorDetails } from '@winglet/common-utils/error';
import { isEmptyObject } from '@winglet/common-utils/filter';

export interface DevelopmentIssue {
  code: string;
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
 * - Silent when `process.env.NODE_ENV === 'production'`. This expression is
 *   intentionally direct so consumer bundlers can replace it statically.
 * - Deduplicated per session by `code + message`, so warnings raised from
 *   per-node pipelines (e.g. schema merging) cannot flood the console.
 * @param issue - The diagnostic to report, carrying code, message, and details
 */
export const warnDevelopmentIssue = (issue: DevelopmentIssue): void => {
  if (process.env.NODE_ENV === 'production') return;
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
