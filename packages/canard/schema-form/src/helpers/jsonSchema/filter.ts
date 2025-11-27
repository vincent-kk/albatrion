import type { JsonSchemaType } from '@/schema-form/types/jsonSchema';

/**
 * Type guard to check if a type is a terminal type.
 * @param type - The type to check
 * @returns Whether the type is a terminal type
 */
export const isTerminalType = (type: JsonSchemaType) =>
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
export const isBranchType = (type: JsonSchemaType) =>
  type === 'array' || type === 'object' || type === 'virtual';
