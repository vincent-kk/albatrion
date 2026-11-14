import { JSONSchemaScanError } from '../../error/JSONSchemaScanError';
import { JSONSchemaScanErrorCode } from '../../error/JSONSchemaScanErrorCode';

/** Identity-bearing keywords cannot change through a visitor's replacement value. */
const identifiers = [
  '$id',
  'id',
  '$schema',
  '$anchor',
  '$dynamicAnchor',
  '$recursiveAnchor',
] as const;

/**
 * Reject changes to lexical identity before recording a mutation.
 * @param original Schema visible before mutation.
 * @param replacement Non-undefined mutation result.
 * @returns Nothing when every identity-bearing field is unchanged.
 * @throws identifier-mutation when a field is added, changed or removed.
 */
export function assertIdentifiersUnchanged(
  original: unknown,
  replacement: unknown,
): void {
  for (const key of identifiers) {
    const before =
      original !== null && typeof original === 'object'
        ? (original as Record<string, unknown>)[key]
        : undefined;
    const after =
      replacement !== null && typeof replacement === 'object'
        ? (replacement as Record<string, unknown>)[key]
        : undefined;
    if (before !== after)
      throw new JSONSchemaScanError(
        JSONSchemaScanErrorCode.IdentifierMutation,
        'Mutation changes identifier ' + key,
      );
  }
}
