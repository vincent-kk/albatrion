import type { FieldNodeRuntime } from '../../../record';

/**
 * Apply the last committed settings after the outer chain and its reporting finish.
 * @param runtime - Owner with no active chain, entry or standalone delivery.
 * @param preserveFailure - Abort whose original exception takes precedence over cleanup failures.
 * @returns Nothing; the callback is cleared first so reentry owns a fresh update.
 */
export const flushFieldNodeSettings = (
  runtime: Pick<
    FieldNodeRuntime<unknown>,
    | 'pendingSettings'
    | 'entryDepth'
    | 'chainRoot'
    | 'chainErrors'
    | 'flushingQueuedEvents'
    | 'reportingErrors'
  >,
  preserveFailure?: { readonly error: unknown },
): void => {
  if (
    runtime.entryDepth ||
    runtime.chainRoot ||
    runtime.chainErrors ||
    runtime.flushingQueuedEvents ||
    runtime.reportingErrors
  )
    return;
  const apply = runtime.pendingSettings;
  runtime.pendingSettings = undefined;
  try {
    apply?.();
  } catch (error) {
    if (!preserveFailure) throw error;
  }
};
