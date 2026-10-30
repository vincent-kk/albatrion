import type { Dictionary } from '@aileron/declare';

/**
 * Narrow an object envelope for unknown-valued property reads.
 * @param value - Opaque input whose prototype and getters remain unchanged
 * @returns Whether the value is a non-null object, including arrays and instances
 */
export const isObjectRecord = (
  value: unknown,
): value is Readonly<Dictionary<unknown>> =>
  value !== null && typeof value === 'object';
