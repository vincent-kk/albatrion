/**
 * Canonicalize JSON-safe observations while retaining object and array order.
 * @param value - A checkpoint already encoded by serializeGateTableObservation
 * @returns Insertion-ordered JSON without indentation or a trailing newline
 */
export const canonicalGateTableJSON = (value: unknown): string =>
  JSON.stringify(value);
