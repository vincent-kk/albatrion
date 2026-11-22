import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

// Current plugin source and the AJV 6 copy it resolves (6.12.6), not the root AJV 8.
import Ajv6 from '../../../../schema-form-ajv6-plugin/node_modules/ajv';
import { createValidator } from '../../../../schema-form-ajv6-plugin/src/index';

/**
 * Form-level symptom of the AJV 6 cached-reference path defect. The bound instance holds an
 * address schema (validation.mdx:60 tells consumers to provide referenced schemas there), and the
 * form maps entries to it through `additionalProperties`, a placement the blueprint accepts. When
 * application code sharing the instance validated the address schema first, the form reports the
 * entry's issue at `/addresses/home.street`, which is not a JSON Pointer to the rejected value.
 */
const country = { $id: 'https://example.com/country.json', type: 'string', enum: ['KR', 'US'] };
const address = {
  $id: 'https://example.com/address.json',
  type: 'object',
  properties: {
    street: { type: 'string', minLength: 3 },
    country: { $ref: 'country.json' },
  },
};

const mount = (validatedFirst: boolean) => {
  const ajv = new (Ajv6 as any)({ allErrors: true });
  ajv.addSchema(country);
  ajv.addSchema(address);
  if (validatedFirst) ajv.validate('https://example.com/address.json', { street: 'y' });
  return nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        addresses: {
          type: 'object',
          additionalProperties: { $ref: 'https://example.com/address.json' },
        },
      },
    } as any,
    defaultValue: { addresses: { home: { street: 'x', country: 'KR' } } } as any,
    validationMode: ValidationMode.OnRequest,
    validator: createValidator(ajv),
  });
};

describe('ajv6 form issue path under a cached referenced validator', () => {
  it('[control] without earlier application use the issue path is a JSON Pointer', async () => {
    const root = mount(false);
    const all = await root.validate();
    expect(all.map((issue) => issue.dataPath)).toEqual(['/addresses/home/street']);
  });

  it('after the application validated the referenced schema the issue path is still a JSON Pointer', async () => {
    const root = mount(true);
    const all = await root.validate();
    expect(all.map((issue) => issue.dataPath)).toEqual(['/addresses/home/street']);
  });
});
