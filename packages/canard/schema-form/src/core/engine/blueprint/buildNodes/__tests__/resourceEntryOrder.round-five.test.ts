import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

it.each([
  ['id', 'http://json-schema.org/draft-04/schema#'],
  ['$id', 'http://json-schema.org/draft-07/schema#'],
])('resource %s uses the same local definition from every first entry', (key, dialect) => {
  const inner = { type: 'string', default: 'house' } as const;
  const resource = { [key]: 'address.json', type: 'object', properties: { kind: { $ref: '#/definitions/kind' } }, definitions: { kind: inner } } as const;
  const expected = nodeFromJSONSchema({ jsonSchema: { type: 'object', properties: { home: { type: 'object', properties: { kind: inner } } } } }).value;
  for (const first of ['pointer', 'identifier', 'inline', 'descendant']) {
    const home = first === 'inline' ? resource : first === 'descendant' ? { type: 'object', properties: { kind: { $ref: '#/definitions/address/properties/kind' } } } : { $ref: first === 'pointer' ? '#/definitions/address' : 'address.json' };
    const schema = { $schema: dialect, [key]: 'https://example.test/root.json', type: 'object', definitions: { kind: { type: 'number', default: 1 }, address: resource }, properties: { home } } as const;
    const actual = nodeFromJSONSchema({ jsonSchema: schema });
    expect(actual.value, first).toEqual(expected);
  }
});
