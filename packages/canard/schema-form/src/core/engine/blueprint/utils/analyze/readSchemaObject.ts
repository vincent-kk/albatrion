import type { Dictionary } from '@aileron/declare';

import type { BlueprintSchema } from '../../types/schema';

/**
 * Read shape syntax from an object schema without interpreting boolean constraints.
 * @param schema - Authored JSON Schema object or boolean
 * @returns The authored object, or an empty read-only shape for a boolean constraint
 */
export const readSchemaObject = (
  schema: BlueprintSchema,
): Readonly<Dictionary> & {
  properties?: Readonly<Dictionary<BlueprintSchema>>;
} => (typeof schema === 'boolean' ? {} : schema);
