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
  try {
    if (!base && reference.startsWith('#')) return reference;
    return base ? new URL(reference, base).href : new URL(reference).href;
  } catch {
    return undefined;
  }
}
