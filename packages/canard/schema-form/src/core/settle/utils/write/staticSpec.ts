import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { UnionSpec } from '../../../record';

/**
 * Convert a fixed blueprint type into the row's static interpretation input.
 * @param schemaType - Immutable type restriction of the node template
 * @param nullable - Whether the fixed restriction accepts null
 * @returns Non-null candidate list and nullable marker for a behavior row
 */
export const staticSpec = (
  schemaType: BlueprintSchemaType,
  nullable: boolean,
): UnionSpec => {
  const all: readonly SchemaTypeName[] = typeof schemaType === 'string'
    ? schemaType === 'virtual' ? [] : [schemaType]
    : schemaType;
  const kinds = all.filter(
    (kind): kind is Exclude<SchemaTypeName, 'null'> => kind !== 'null',
  );
  return { kinds: kinds.length === 1 ? kinds[0] : kinds, mask: 0, nullable };
};
