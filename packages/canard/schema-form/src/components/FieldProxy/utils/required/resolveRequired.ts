/**
 * Resolve the shared display indicator without changing schema validation.
 * @param override - Direct presentation override; non-booleans fall through
 * @param inherited - Less specific presentation value; false remains authoritative
 * @param fallback - Node constraint, or undefined to defer schema resolution
 * @returns The first boolean presentation value, or the supplied fallback
 */
export const resolveRequired = <Fallback extends boolean | undefined>(
  override: unknown,
  inherited: unknown,
  fallback: Fallback,
): boolean | Fallback =>
  typeof override === 'boolean'
    ? override
    : typeof inherited === 'boolean'
      ? inherited
      : fallback;
