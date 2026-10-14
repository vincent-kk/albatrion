import type { SchemaTypeName } from '../../type';

/**
 * Encode a kind set independently of integer restrictions and nullable decoration.
 * @param types - Accepted explicit JSON types, including possible null
 * @returns A stable bit mask used for same-kind grouping and containment
 */
export const foldAllowedTypes = (types: readonly SchemaTypeName[]): number => {
  let mask = 0;
  for (const type of types) if (type !== 'null') mask |= TYPE_MASK[type];
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
