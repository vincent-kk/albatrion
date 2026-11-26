import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

const ID = 'http://example.com/item.json';
/** A resource whose `not.required` issue AJV6 reports at `<ID>/properties/named/not`. */
const item = (identifier: string) => ({
  [identifier]: ID,
  type: 'object',
  properties: { named: { type: 'object', not: { required: ['x'] } } },
});

describe('FRAGMENT-020 rejectedKey inside identified resources', () => {
  it('control: ignores an id member when the bound Ajv uses the default schemaId', async () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const resource = item('$id');
    const named = { ...resource.properties.named, id: `${ID}/properties` };
    const schema = {
      type: 'object',
      definitions: { item: { ...resource, properties: { named } } },
      properties: { b: { $ref: ID } },
    };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ b: { named: { x: 1 } } });
    expect(issues?.find((issue) => issue.keyword === 'not')).toMatchObject({ dataPath: '/b/named', rejectedKey: 'x' });
  });
});

it('reads the rejected key from the compiled copy after the authored schema changes', async () => {
  ajvValidatorPlugin.bind(new Ajv({ allErrors: true }));
  const required = ['original'];
  const schema = { $id: 'https://example.test/compiled-key', not: { required } };
  const validate = ajvValidatorPlugin.compile(schema);
  required[0] = 'changed';
  expect((await validate({ original: true }))?.[0]?.rejectedKey).toBe('original');
});
