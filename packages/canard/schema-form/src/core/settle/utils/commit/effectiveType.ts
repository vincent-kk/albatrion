import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Read an active schema's type restriction with the static list as fallback.
 * @param node - Node whose effective schema was chosen in the host wheel
 * @returns Current declared JSON types in their authored representation
 */
export const effectiveType = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): BlueprintSchemaType => {
  const schema = node.schema.schema;
  const candidate = typeof schema === 'object' && schema !== null
    ? schema.type : undefined;
  if (typeof candidate === 'string' && isTypeName(candidate)) return candidate;
  if (Array.isArray(candidate) && candidate.every(isTypeName))
    return candidate;
  return node.schemaType;
};

/** Identify only JSON Schema type names; other authored values stay opaque. */
function isTypeName(value: unknown): value is SchemaTypeName {
  return value === 'string' || value === 'number' || value === 'integer' ||
    value === 'boolean' || value === 'null' || value === 'object' ||
    value === 'array';
}
