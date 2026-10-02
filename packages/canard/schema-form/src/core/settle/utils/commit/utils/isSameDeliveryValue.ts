/**
 * Judge whether a delivered field kept its value: identity, with `NaN` equal to `NaN` (SameValueZero).
 * @param previous - Value seen at the last delivery
 * @param current - Value after this commit
 * @returns Whether no change is delivered for the pair
 */
export const isSameDeliveryValue = (previous: unknown, current: unknown): boolean =>
  previous === current || Number.isNaN(previous) && Number.isNaN(current);
