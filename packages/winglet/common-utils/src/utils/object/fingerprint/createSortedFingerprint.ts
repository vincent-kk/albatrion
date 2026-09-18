import type { FingerprintOptions } from './type';
import { writeSortedFingerprint } from './utils/writeSortedFingerprint';

/**
 * Creates a sorted flattened-path key with cycle markers.
 * @param value Enumerable data; cycles become markers and Map/Set contents are not traversed.
 * @param options Recursive property exclusions and an optional prefix.
 * @returns A string key retaining the legacy path/type ambiguities.
 */
export function createSortedFingerprint(
  value: unknown,
  options?: FingerprintOptions,
): string {
  const key = writeSortedFingerprint(value, options?.omit);
  return options?.prefix ? options.prefix + key : key;
}
