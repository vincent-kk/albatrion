import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { UnionSpec } from '../../../record';
import { scalarSpecs, unionSpecs } from '../../../utils/cache/valueMemos';

const NO_KINDS: readonly Exclude<SchemaTypeName, 'null'>[] = Object.freeze([]);
/** Specs for a template without a JSON type, indexed like the caches by nullable. */
const NO_KIND_SPECS: readonly UnionSpec[] = [
  { kinds: NO_KINDS, mask: 0, nullable: false },
  { kinds: NO_KINDS, mask: 0, nullable: true },
];

/**
 * Convert a fixed blueprint type into the row's static interpretation input.
 * @param schemaType - Immutable type restriction of the node template; undefined for a virtual template, which admits no kind
 * @param nullable - Whether the fixed restriction accepts null
 * @returns Non-null candidate list and nullable marker for a behavior row
 */
export const staticSpec = (
  schemaType: BlueprintSchemaType | undefined,
  nullable: boolean,
): UnionSpec => {
  const index = nullable ? 1 : 0;
  if (schemaType === undefined) return NO_KIND_SPECS[index];
  if (typeof schemaType === 'string') {
    const cached = scalarSpecs[index].get(schemaType);
    if (cached) return cached;
    const kinds = schemaType === 'null' ? NO_KINDS : schemaType;
    const spec: UnionSpec = { kinds, mask: 0, nullable };
    scalarSpecs[index].set(schemaType, spec);
    return spec;
  }
  const cached = unionSpecs[index].get(schemaType);
  if (cached) return cached;
  const kinds: Exclude<SchemaTypeName, 'null'>[] = [];
  for (let index = 0, length = schemaType.length; index < length; index++) {
    if (!(index in schemaType)) continue;
    const kind = schemaType[index];
    if (kind !== 'null') kinds.push(kind);
  }
  const spec: UnionSpec = {
    kinds: kinds.length === 1 ? kinds[0] : kinds,
    mask: 0,
    nullable,
  };
  unionSpecs[index].set(schemaType, spec);
  return spec;
};
