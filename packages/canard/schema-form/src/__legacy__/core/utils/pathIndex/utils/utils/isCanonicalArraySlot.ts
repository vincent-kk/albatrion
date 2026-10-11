/**
 * Classify one escaped segment without regex evaluation for every ancestor.
 * @param segment - Nonempty decimal slot candidate
 * @returns Whether it is the canonical spelling of a nonnegative safe integer
 */
export const isCanonicalArraySlot = (segment: string): boolean => {
  if (!segment.length || segment.length > 16 ||
    segment.length > 1 && segment.charCodeAt(0) === 48) return false;
  for (let i = 0; i < segment.length; i++) {
    const digit = segment.charCodeAt(i);
    if (digit < 48 || digit > 57) return false;
  }
  return Number.isSafeInteger(Number(segment));
};
