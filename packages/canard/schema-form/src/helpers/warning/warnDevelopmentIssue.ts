import type { BaseError } from '@winglet/common-utils/error';
import { isEmptyObject } from '@winglet/common-utils/filter';

/** Development warnings already emitted in this session, keyed by code + message. */
const emittedWarnings = new Set<string>();

/**
 * Reports a development-only diagnostic through the shared error taxonomy.
 *
 * Mirrors the `SchemaFormError` pattern used for hard failures (e.g. the
 * `INFINITE_LOOP_DETECTED` throw in `EventCascadeManager`): the same
 * `code + formatted message + details` triple, emitted as a console warning
 * instead of being thrown.
 *
 * @remarks
 * - Silent when `process.env.NODE_ENV === 'production'`; consumer bundlers
 *   replace the expression and drop the branch entirely.
 * - Deduplicated per session by `code + message`, so warnings raised from
 *   per-node pipelines (e.g. schema merging) cannot flood the console.
 * @param error - The diagnostic to report, carrying code, message, and details
 */
export const warnDevelopmentIssue = <Error extends BaseError>(
  error: Error,
): void => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
    return;
  const signature = `${error.code}\n${error.message}`;
  if (emittedWarnings.has(signature)) return;
  emittedWarnings.add(signature);
  if (isEmptyObject(error.details))
    console.warn(`[@canard/schema-form] ${error.code}\n${error.message}`);
  else
    console.warn(
      `[@canard/schema-form] ${error.code}\n${error.message}`,
      error.details,
    );
};
