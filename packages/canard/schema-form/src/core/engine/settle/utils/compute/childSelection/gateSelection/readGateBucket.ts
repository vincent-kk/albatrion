import type { GateSelectionLiteral } from '../../../../types/gateSelectionTable';

/** No bucket matches a non-primitive value, undefined, NaN or an unlisted literal. */
const EMPTY: readonly number[] = Object.freeze([]);

/**
 * Match Map's primitive keys without coercion or widening the literal contract.
 * @param buckets - Immutable literal-to-index metadata
 * @param value - Projected watched value, which may have any runtime kind
 * @returns Matching sorted indices or the shared empty list
 */
export const readGateBucket = (
  buckets: ReadonlyMap<GateSelectionLiteral, readonly number[]>,
  value: unknown,
): readonly number[] =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? (buckets.get(value) ?? EMPTY)
    : EMPTY;
