/**
 * Decide whether a caller's virtual tuple writes a constituent.
 * @param isPresent - Whether the constituent is live when the slot is admitted.
 * @param value - Value of an absent slot, or the value already read during composition.
 * @returns Whether the tuple supplies a write at the constituent's storage address.
 */
export const isVirtualWriteFieldAdmitted = (
  isPresent: boolean,
  value: unknown,
): boolean => isPresent || value !== undefined;
