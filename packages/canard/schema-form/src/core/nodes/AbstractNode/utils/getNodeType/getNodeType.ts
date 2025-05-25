import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Extracts the node type from the schema type.
 * Converts 'integer' to 'number' for unification.
 * @param schema - JSON schema
 * @returns Node type
 */
export const getNodeType = <Schema extends JsonSchemaWithVirtual>({
  type,
}: Schema) => {
  if (type === 'number' || type === 'integer')
    return 'number' as Exclude<Schema['type'], 'integer'>;
  else return type as Exclude<Schema['type'], 'integer'>;
};
