import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const getNodeType = <Schema extends JsonSchemaWithVirtual>({
  type,
}: Schema) => {
  if (type === 'number' || type === 'integer')
    return 'number' as Exclude<Schema['type'], 'integer'>;
  else return type as Exclude<Schema['type'], 'integer'>;
};
