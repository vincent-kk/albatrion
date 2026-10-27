import { collectIfGateReadNames } from './collectIfGateReadNames';

/** Read evidence follows immutable authored conditions, including negative proofs. */
const READ_NAMES = new WeakMap<object, readonly string[] | null>();
/** Boolean conditions inspect no value or property identity. */
const EMPTY_NAMES: readonly string[] = Object.freeze([]);

/**
 * Cache a finite property-read proof without executing or decompiling a guard.
 * @param condition - Authored immutable JSON Schema condition
 * @returns Unique top-level names, or undefined for a whole-host read
 */
export const getIfGateReadNames = (
  condition: unknown,
): readonly string[] | undefined => {
  if (typeof condition === 'boolean') return EMPTY_NAMES;
  if (!condition || typeof condition !== 'object') return undefined;
  const cached = READ_NAMES.get(condition);
  if (cached !== undefined) return cached ?? undefined;
  const names: string[] = [];
  const result = collectIfGateReadNames(condition, names, false)
    ? names
    : undefined;
  READ_NAMES.set(condition, result ?? null);
  return result;
};
