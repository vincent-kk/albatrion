import type { JSONSchema } from '@canard/schema-form';

/**
 * Copy scenario data as the engine passes its own copy to the validator.
 * @param value - JSON data from the shared catalogue
 * @returns A deep JSON copy typed as a schema-form schema
 */
export const copyOf = (value: unknown): JSONSchema => JSON.parse(JSON.stringify(value)) as JSONSchema;
