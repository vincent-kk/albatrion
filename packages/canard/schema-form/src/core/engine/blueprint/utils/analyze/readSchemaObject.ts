import type { BlueprintSchema } from '../../type';

/**
 * Read shape syntax from an object schema without interpreting boolean constraints.
 * @param schema - Authored JSON Schema object or boolean
 * @returns The authored object, or an empty read-only shape for a boolean constraint
 */
export const readSchemaObject = (
  schema: BlueprintSchema,
): Readonly<Record<string, any>> & {
  properties?: Readonly<Record<string, BlueprintSchema>>;
} => (typeof schema === 'boolean' ? {} : schema);
