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
/** An id-shaped object that would steal that path if it were read as a resource. */
const annotation = { $id: `${ID}/properties` };

describe('FRAGMENT-020 rejectedKey inside identified resources', () => {
  it.each([
    ['const', annotation],
    ['enum', [annotation]],
    ['examples', [annotation]],
    ['default', annotation],
  ])('ignores an id-shaped object inside %s', async (keyword, value) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const schema = {
      type: 'object',
      definitions: { item: item('$id') },
      properties: { b: { $ref: ID }, note: { [keyword]: value } },
    };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ b: { named: { x: 1 } } });
    expect(issues?.find((issue) => issue.keyword === 'not')).toMatchObject({ dataPath: '/b/named', rejectedKey: 'x' });
  });

  it.each(['default', 'enum'])('collects a resource declared by a field named %s', async (field) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true }));
    const resource = {
      $id: ID,
      type: 'object',
      properties: {
        items: { type: 'array', if: { minItems: 1 }, then: false },
        named: { type: 'object', not: { required: ['x'] } },
      },
    };
    const schema = { type: 'object', properties: { [field]: resource, b: { $ref: ID } } };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ b: { items: [1], named: { x: 1 } } });
    const falseIssue = issues?.find((issue) => issue.keyword === 'false schema');
    expect(falseIssue).toMatchObject({ dataPath: '/b/items' });
    expect(falseIssue?.rejectedKey).toBeUndefined();
    expect(issues?.find((issue) => issue.keyword === 'not')).toMatchObject({ dataPath: '/b/named', rejectedKey: 'x' });
  });

  it.each(['auto', 'id'] as const)('identifies a draft-04 id resource when the bound Ajv uses schemaId %s', async (schemaId) => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true, schemaId }));
    const schema = { type: 'object', definitions: { item: item('id') }, properties: { b: { $ref: ID } } };
    const issues = await ajvValidatorPlugin.compile(schema as unknown as JSONSchema)({ b: { named: { x: 1 } } });
    expect(issues?.find((issue) => issue.keyword === 'not')).toMatchObject({ dataPath: '/b/named', rejectedKey: 'x' });
  });

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
