import type { Optional } from '@aileron/declare';

/**
 * Hide an item-less projected array while preserving nonempty identity.
 * @param value - Array after optional suffix trimming
 * @returns Undefined for no items, otherwise the same array reference
 */
export const omitEmptyArray = (
  value: readonly unknown[],
): Optional<readonly unknown[]> => (value.length === 0 ? undefined : value);
