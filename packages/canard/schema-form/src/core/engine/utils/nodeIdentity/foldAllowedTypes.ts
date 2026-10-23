/**
 * Encode a kind set independently of integer restrictions and nullable decoration.
 * @param types - Closed JSON type name, readonly type list, or undefined for no type
 * @returns A stable bit mask used for same-kind grouping and containment
 */
export const foldAllowedTypes = (
  types:
    | keyof typeof TYPE_MASK
    | readonly (keyof typeof TYPE_MASK)[]
    | undefined,
): number => {
  const allowed = typeof types === 'string' ? [types] : (types ?? []);
  let mask = 0;
  for (const type of allowed) if (type !== 'null') mask |= TYPE_MASK[type];
  return mask || TYPE_MASK.null;
};

/** Integer shares number's bit; null owns a bit only for a null-only node. */
const TYPE_MASK = {
  string: 1,
  number: 2,
  integer: 2,
  boolean: 4,
  object: 8,
  array: 16,
  null: 32,
} as const;
