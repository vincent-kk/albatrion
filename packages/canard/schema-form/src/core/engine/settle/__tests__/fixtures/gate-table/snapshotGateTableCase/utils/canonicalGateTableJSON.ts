import { isArray } from '@winglet/common-utils/filter';

/**
 * Canonicalize JSON-safe observations while retaining every ordered array entry.
 * @param value - A checkpoint already encoded by serializeGateTableObservation
 * @returns Sorted-key JSON without indentation or a trailing newline
 */
export const canonicalGateTableJSON = (value: unknown): string =>
  JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([left], [right]) =>
            left < right ? -1 : left > right ? 1 : 0,
          ),
        )
      : item,
  );
