/**
 * Hide an item-less projected array while preserving nonempty identity.
 * @param value - Array after optional suffix trimming
 * @returns Undefined for no items, otherwise the same array reference
 */
export const omitEmptyArray = (value: readonly unknown[]): readonly unknown[] | undefined =>
  value.length === 0 ? undefined : value;
