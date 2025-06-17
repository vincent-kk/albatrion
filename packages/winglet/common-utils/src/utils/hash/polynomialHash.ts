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
 * @param length - Desired length of the result identifier (default: 7, max: 7).
 * @returns A base36-encoded hash string of the specified length.
 */
export const polynomialHash = (target: string, length = 7): string => {
  let hash = 0;
  for (let index = 0; index < target.length; index++)
    hash = (hash * 31 + target.charCodeAt(index)) | 0;
  return (hash >>> 0).toString(36).padStart(length, '0').slice(0, length);
};
