import type { Optional } from '@aileron/declare';

import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
  BIT_FLAG_05,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';

/**
 * Encode a kind set independently of integer restrictions and nullable decoration.
 * @param types - Closed JSON type name, readonly type list, or undefined for no type
 * @returns A stable bit mask used for same-kind grouping and containment
 */
export const foldAllowedTypes = (
  types: Optional<keyof typeof TYPE_MASK | readonly (keyof typeof TYPE_MASK)[]>,
): number => {
  const allowed = typeof types === 'string' ? [types] : (types ?? []);
  let mask = BIT_MASK_NONE;
  for (const type of allowed) if (type !== 'null') mask |= TYPE_MASK[type];
  return mask || TYPE_MASK.null;
};

/** Integer shares number's bit; null owns a bit only for a null-only node. */
const TYPE_MASK = {
  string: BIT_FLAG_00,
  number: BIT_FLAG_01,
  integer: BIT_FLAG_01,
  boolean: BIT_FLAG_02,
  object: BIT_FLAG_03,
  array: BIT_FLAG_04,
  null: BIT_FLAG_05,
} as const;
