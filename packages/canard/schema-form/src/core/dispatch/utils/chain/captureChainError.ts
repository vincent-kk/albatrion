import type { SchemaNodeRuntime } from '../../../record';

/**
 * Retain a failure for both final throwing and ordered record delivery.
 * @param runtime - Runtime of the active public entry
 * @param error - Original failure value, including non-Error throws
 * @returns Nothing; the chain owns the retained occurrence
 */
export const captureChainError = <Self>(
  runtime: SchemaNodeRuntime<Self>, error: unknown,
): void => {
  runtime.chainErrors?.push(error);
  if (runtime.errorReporter?.hasConsumer())
    runtime.chainOccurrences?.push({ kind: 'error', error });
};
