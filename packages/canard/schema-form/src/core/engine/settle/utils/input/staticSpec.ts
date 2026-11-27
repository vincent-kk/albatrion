import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Optional } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { UnionSpec } from '../../../record';
import { scalarSpecs, unionSpecs } from '../../../utils/cache/valueMemos';

/** Specs for a template without a JSON type, indexed like the caches by `isNullable`. */
const NO_KIND_SPECS: readonly UnionSpec[] = [
  { kinds: EMPTY_ARRAY, mask: BIT_MASK_NONE, isNullable: false },
  { kinds: EMPTY_ARRAY, mask: BIT_MASK_NONE, isNullable: true },
];

/**
 * Convert a fixed blueprint type into the row's static interpretation input.
 * @param schemaType - Immutable type restriction of the node template; undefined for a virtual template, which admits no kind
 * @param isNullable - Whether the fixed restriction accepts null
 * @returns Non-null candidate list and `isNullable` marker for a behavior row
 */
export const staticSpec = (
  schemaType: Optional<BlueprintSchemaType>,
  isNullable: boolean,
): UnionSpec => {
  const index = isNullable ? 1 : 0;
  if (schemaType === undefined) return NO_KIND_SPECS[index];
  if (typeof schemaType === 'string') {
    const cached = scalarSpecs[index].get(schemaType);
    if (cached) return cached;
    const kinds = schemaType === 'null' ? EMPTY_ARRAY : schemaType;
    const spec: UnionSpec = { kinds, mask: BIT_MASK_NONE, isNullable };
    scalarSpecs[index].set(schemaType, spec);
    return spec;
  }
  const cached = unionSpecs[index].get(schemaType);
  if (cached) return cached;
  const kinds: Exclude<SchemaTypeName, 'null'>[] = [];
  for (let index = 0, length = schemaType.length; index < length; index++) {
    const kind = schemaType[index];
    if (kind !== 'null') kinds.push(kind);
  }
  const spec: UnionSpec = {
    kinds: kinds.length === 1 ? kinds[0] : kinds,
    mask: BIT_MASK_NONE,
    isNullable,
  };
  unionSpecs[index].set(schemaType, spec);
  return spec;
};
