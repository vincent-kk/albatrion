import type {
  JSONSchemaType,
  JSONSchemaWithVirtual,
} from '@/schema-form/types/jsonSchema';

import { extractSchemaInfo } from './extractSchemaInfo';

/**
 * Type guard to check if a type is a terminal type.
 * @param type - The type to check
 * @returns Whether the type is a terminal type
 */
export const isTerminalType = (type: JSONSchemaType) =>
  type === 'boolean' ||
  type === 'number' ||
  type === 'integer' ||
  type === 'string' ||
  type === 'null';

/**
 * Type guard to check if a type is a branch type.
 * @param type - The type to check
 * @returns Whether the type is a branch type
 */
export const isBranchType = (type: JSONSchemaType) =>
  type === 'array' || type === 'object' || type === 'virtual';

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
