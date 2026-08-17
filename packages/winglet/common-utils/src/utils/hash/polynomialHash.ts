/**
 * Computes a 31-based polynomial rolling hash of the input string,
 * and returns a base36-encoded identifier of the given length.
 *
 * This method mimics the behavior of Java's `String.hashCode()`,
 * ensuring fast, deterministic, and compact hash generation.
 *
 * Note: This hash is **not cryptographically secure**, and is best suited
 * for quick identification or lookup purposes (e.g. cache keys, short IDs).
 *
 * @param target - The input string to hash.
 * @param length - Desired length of the result identifier (default: 7). A uint32 needs at
 *   most 7 base36 digits, so a longer length is zero-padded and a shorter one keeps the
 *   low-order digits.
 * @returns A base36-encoded hash string of the specified length.
 */
export const polynomialHash = (target: string, length = 7): string => {
  let hash = 0;
  for (let i = 0, l = target.length; i < l; i++)
    hash = (hash * 31 + target.charCodeAt(i)) | 0;
  // Guarded because slice(-0) is slice(0) and would hand back the whole identifier
  if (length <= 0) return '';
  // Low-order digits carry the entropy; keeping the leading ones would collapse every
  // nearby hash onto the same prefix
  return (hash >>> 0).toString(36).padStart(length, '0').slice(-length);
};
