/** Internal annotation of a batch branch carrying a wrong-kind source and child inputs together. */
export const BATCH_HOST_SOURCE = Symbol('batchHostSource');

/**
 * Carry an unreleased host source alongside the caller's composed child inputs.
 * @param input - Owned copy of the composed input
 * @param source - Source to retain, or undefined when the host can assemble
 * @returns Nothing; the hidden source describes the owned input only
 */
export const writeBatchHostSource = (input: object, source: unknown): void => {
  if (source === undefined) Reflect.deleteProperty(input, BATCH_HOST_SOURCE);
  else
    Object.defineProperty(input, BATCH_HOST_SOURCE, {
      value: source,
      enumerable: true,
      configurable: true,
    });
};
