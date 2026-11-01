import type { JSONSchema } from '@canard/schema-form';

import {
  buildArraySchema,
  buildFlatSchema,
  buildNestedSchema,
} from '../../src/fixtures/scale-schemas';
import type { InputFixture } from './types';

/**
 * Build the IR-2 heavy-validation rows using the canonical scale generators.
 * @param id - An id from ir-2-cases.json; callers validate membership.
 * @returns Fresh OnChange schema with alternating typing verdicts or a first-second mount window.
 */
export function getHeavyValidationFixture(id: string): InputFixture {
  const nested = id.includes('nested');
  const array = id.includes('array');
  const conditional = id.includes('if-flat');
  const mount = id.startsWith('mount-');
  const flatCount = id.includes('2000') ? 2000 : 500;
  let schema = nested
    ? buildNestedSchema(5, 4)
    : array
      ? buildArraySchema(1000)
      : buildFlatSchema(flatCount);
  let target = nested
    ? '/n0/n0/n0/n0/n0'
    : array
      ? '/items/0/name'
      : '/field_000';
  if (conditional) {
    // IR-1's guard profile uses unpadded keys and no field defaults.
    schema = {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: 500 }, (_, index) => [
          `field_${index}`,
          { type: 'string' },
        ]),
      ),
      if: { properties: { kind: { const: 'a' } } },
      then: { properties: { field_0: { minLength: 2 } } },
    } as JSONSchema;
    schema.properties!.kind = { type: 'string', default: 'a' };
    target = '/field_0';
  }
  if (!mount) {
    let leaf = schema;
    if (array)
      leaf = (schema.properties!.items!.items as JSONSchema).properties!.name!;
    else
      for (const segment of target.slice(1).split('/'))
        leaf = leaf.properties![segment] as JSONSchema;
    leaf.pattern = '^(?:..)*$';
  }
  return {
    id,
    schema,
    target,
    expectedInputs: nested
      ? 1024
      : array
        ? 3000
        : conditional
          ? 501
          : flatCount,
    validation: true,
    mount,
    virtualization: false,
    intervalMs: id.endsWith('-nonburst') ? 100 : 0,
    mountObservationMs: mount ? 1000 : undefined,
    defaultValidation: mount,
  };
}
