import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { BlueprintSchemaType, SchemaTypeName } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';

/**
 * Read an active schema's type restriction with the static list as fallback.
 * @param node - Node whose effective schema was chosen in the host wheel
 * @returns Current declared JSON types in their authored representation; undefined for a virtual node
 */
export const effectiveType = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): Optional<BlueprintSchemaType> => {
  const schema = node.schema.schema;
  const candidate =
    typeof schema === 'object' && schema !== null ? schema.type : undefined;
  if (typeof candidate === 'string' && isTypeName(candidate)) return candidate;
  if (isArray(candidate) && isTypeNameList(candidate)) return candidate;

  return node.schemaType;
};

/** Identify only JSON Schema type names; other authored values stay opaque. */
function isTypeName(value: unknown): value is SchemaTypeName {
  return (
    value === 'string' ||
    value === 'number' ||
    value === 'integer' ||
    value === 'boolean' ||
    value === 'null' ||
    value === 'object' ||
    value === 'array'
  );
}

/** Validate authored type names while retaining sparse-list membership semantics.
 * @param values Borrowed effective-schema type list; indexed validation skips sparse slots.
 * @returns Whether each present slot names an accepted schema type.
 */
function isTypeNameList(values: unknown[]): values is SchemaTypeName[] {
  for (let index = 0, length = values.length; index < length; index++)
    if (index in values && !isTypeName(values[index])) return false;
  return true;
}
