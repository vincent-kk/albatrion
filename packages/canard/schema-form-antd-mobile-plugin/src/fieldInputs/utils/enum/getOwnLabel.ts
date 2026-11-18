/**
 * Read a caller-owned label without exposing inherited prototype members.
 * @param labels - Optional display labels keyed by the raw value's string.
 * @param key - Display spelling of the enum value.
 * @returns An own label, or undefined so the input uses its normal fallback.
 */
export const getOwnLabel = <T>(
  labels: Record<string, T> | undefined,
  key: string,
): T | undefined =>
  labels && Object.prototype.hasOwnProperty.call(labels, key)
    ? labels[key]
    : undefined;
