import type { FingerprintOptions } from './type';
import { writeFastFingerprint } from './utils/writeFastFingerprint';

/**
 * Creates a fast, shallow key using reverse root-key order.
 * @param value JSON-compatible data; nested values use JSON.stringify and may throw.
 * @param options Root property exclusions and an optional prefix.
 * @returns A string key; insertion order and legacy delimiter ambiguity are retained.
 */
export function createFingerprint(
  value: unknown,
  options?: FingerprintOptions,
): string {
  const key = writeFastFingerprint(value, options?.omit);
  return options?.prefix ? options.prefix + key : key;
}
