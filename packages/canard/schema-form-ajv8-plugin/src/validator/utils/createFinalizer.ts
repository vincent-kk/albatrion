/// <reference lib="es2021.weakref" preserve="true" />

/**
 * Enable collection cleanup only on hosts that provide FinalizationRegistry.
 * @param cleanup - Resource disposal invoked after the associated root is collected.
 * @returns A native finalizer, or undefined when callers must release roots explicitly.
 */
export const createFinalizer = <T>(cleanup: (registration: T) => void): FinalizationRegistry<T> | undefined =>
  typeof FinalizationRegistry === 'function' ? new FinalizationRegistry(cleanup) : undefined;
