import type { JSONSchemaWithVirtual } from '@/schema-form/types/jsonSchema';

import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema/extractSchemaInfo';

/**
 * Type guard to check if a composition branch schema (oneOf/anyOf) is a null branch.
 * @param schema - The branch schema to check
 * @returns Whether the schema's resolved type is 'null'
 */
export const isNullBranch = <
  Schema extends {
    type?: JSONSchemaWithVirtual['type'];
    nullable?: boolean;
  },
>(
  schema: Schema | undefined,
) => extractSchemaInfo(schema)?.type === 'null';
