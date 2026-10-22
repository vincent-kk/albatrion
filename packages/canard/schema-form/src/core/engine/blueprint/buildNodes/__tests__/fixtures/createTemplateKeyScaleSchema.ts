import type { BlueprintSchema } from '../../../types/schema';

/** Writable construction view for the deterministic nested test fixture. */
interface NestedSchema extends Record<string, unknown> {
  type: 'object' | 'string' | 'boolean';
  default?: string | boolean;
  properties?: Record<string, NestedSchema>;
  controls?: { active: string };
}

/**
 * Reproduce the deterministic mount schemas used by the round-442 measurement fixtures.
 * @param family - Flat, nested, oneOf or nested-gate mount family
 * @param size - Property/branch count, or nested depth with fanout four
 * @returns Authored schema with the measurement fixture's exact content and order
 */
export const createTemplateKeyScaleSchema = (
  family: 'flat' | 'nested' | 'oneOf' | 'nested-gate',
  size: number,
): BlueprintSchema => {
  if (family === 'flat') {
    const properties: Record<string, BlueprintSchema> = {};
    for (let index = 0; index < size; index++)
      properties[`field_${String(index).padStart(3, '0')}`] = {
        type: 'string',
        default: `value_${index}`,
      };
    return { type: 'object', properties };
  }
  if (family === 'oneOf')
    return {
      type: 'object',
      properties: {
        common: { type: 'string', default: 'shared' },
        kind: { type: 'string', default: 'kind_0' },
      },
      oneOf: Array.from({ length: size }, (_, index) => ({
        controls: { active: `./kind === 'kind_${index}'` },
        properties: {
          [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
          [`payload_${index}_b`]: { type: 'number', default: index },
          [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
        },
      })),
    };
  const nested = (depth: number): NestedSchema => {
    if (depth === 0) return { type: 'string', default: 'leaf' };
    const properties: Record<string, NestedSchema> = {};
    for (let index = 0; index < 4; index++)
      properties[`n${index}`] = nested(depth - 1);
    return { type: 'object', properties };
  };
  const schema = nested(size);
  if (family === 'nested-gate') {
    schema.properties = {
      toggle: { type: 'boolean', default: true },
      ...schema.properties,
    };
    let leaf = schema;
    for (let index = 0; index < size; index++)
      leaf = leaf.properties!.n0;
    leaf.controls = { active: '/toggle === true' };
  }
  return schema;
};
