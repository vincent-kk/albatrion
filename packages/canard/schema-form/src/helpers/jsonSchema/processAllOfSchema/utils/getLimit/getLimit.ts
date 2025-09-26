import type { JsonSchema } from '@/schema-form/types';

/**
 * Determines the cloning depth limit based on the JSON Schema type.
 * Object schemas need deeper cloning (depth 3), array schemas need medium depth (depth 2),
 * and primitive types need shallow cloning (depth 1).
 *
 * @param type - The JSON Schema type
 * @returns The cloning depth limit for the given type
 */
export const getLimit = (type: JsonSchema['type']) =>
  type === 'object' ? 3 : type === 'array' ? 2 : 1;
