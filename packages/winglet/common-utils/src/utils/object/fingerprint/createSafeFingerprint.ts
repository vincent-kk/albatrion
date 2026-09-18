import type { SafeFingerprintOptions } from './type';
import { createSafeWriter } from './utils/createSafeWriter';

/** Module-lifetime identity scope for the standalone safe generator. */
const write = createSafeWriter();

/**
 * Creates a sorted, cycle-safe key without constructing graph wire data.
 * @param value Data to inspect; opaque values use reference identity, ordinary getters may run.
 * @param options Recursive exclusions, optional prefix, and sorting enabled by default.
 * @returns A comparison key; shared/copy subtrees and array holes/undefined may compare equally.
 */
export function createSafeFingerprint(
  value: unknown,
  options?: SafeFingerprintOptions,
): string {
  const key = write(value, options?.omit, options?.sort);
  return options?.prefix ? options.prefix + key : key;
}
