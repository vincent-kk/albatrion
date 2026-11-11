import type { FieldNodeRuntime } from '../../../record';
import { abortFieldNodeChain, readChainAbort } from './chainAbort';

/**
 * Retain a failure for both final throwing and ordered record delivery.
 * @param runtime - Runtime of the active public entry
 * @param error - Original failure value, including non-Error throws
 * @returns Nothing; the chain owns the retained occurrence
 */
export const captureChainError = <Self>(
  runtime: FieldNodeRuntime<Self>,
  error: unknown,
): void => {
  const aborted = readChainAbort(runtime.chainErrors);
  if (aborted) throw aborted.error;
  let shouldRecord: boolean | undefined;
  try {
    shouldRecord = runtime.errorReporter?.hasConsumer();
  } catch (failure) {
    throw abortFieldNodeChain(runtime, failure).error;
  }
  runtime.chainErrors?.push(error);
  if (shouldRecord) runtime.chainOccurrences?.push({ kind: 'error', error });
};
