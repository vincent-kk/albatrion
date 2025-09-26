import type { JsonSchema } from '@/schema-form/types';

import { transformCondition } from './utils/transformCondition';

/**
 * Processes a schema with virtual field definitions by transforming required fields,
 * then/else conditions to handle virtual field mappings. Virtual fields allow for
 * conditional form logic where certain fields are only required under specific conditions.
 *
 * @param schema - The partial JSON Schema that may contain virtual field definitions
 * @returns The transformed schema with virtual conditions applied, or null if no virtual processing was needed
 */
export const processVirtualSchema = (schema: Partial<JsonSchema>) => {
  if (schema.virtual === undefined) return null;
  let expired = false;
  if (schema.required) {
    schema = transformCondition(schema, schema.virtual);
    expired = true;
  }
  if (schema.then) {
    schema.then = transformCondition(schema.then, schema.virtual);
    expired = true;
  }
  if (schema.else) {
    schema.else = transformCondition(schema.else, schema.virtual);
    expired = true;
  }
  return expired ? schema : null;
};
