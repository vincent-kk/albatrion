/**
 * Resolve a written URI using the platform URL implementation without inventing a retrieval base.
 * @param reference Written reference or identifier.
 * @param base Known absolute resource URI, or empty for the anonymous document.
 * @returns Normalized URI, or undefined when a relative URI has no usable base.
 */
export function resolveURI(
  reference: string,
  base: string,
): string | undefined {
  // The URL parser rejects an empty input against opaque bases such as urn:,
  // although an empty reference always names the current document like '#'.
  const written = reference || '#';
  try {
    if (!base && written.startsWith('#')) return written;
    return base ? new URL(written, base).href : new URL(written).href;
  } catch {
    return undefined;
  }
}
