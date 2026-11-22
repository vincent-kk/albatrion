import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

it.each([
  'http://json-schema.org/draft-04/schema#',
  'http://json-schema.org/draft-06/schema#',
  'http://json-schema.org/draft-07/schema#',
  'https://json-schema.org/draft/2019-09/schema',
  'https://json-schema.org/draft/2020-12/schema',
])('identifier forms obey the dialect %s', (dialect) => {
  const inner = {
    type: 'object',
    properties: { city: { type: 'string', default: 'Seoul' } },
  } as const;
  const expected = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: { home: inner } },
  }).value;
  for (const identifier of [
    'https://example.test/address.json',
    'address.json',
    '#address',
    '#',
    'address.json#',
  ]) {
    const load = () =>
      nodeFromJSONSchema({
        jsonSchema: {
          $schema: dialect,
          $id: 'https://example.test/root.json',
          type: 'object',
          properties: { home: { $ref: '#/definitions/address' } },
          definitions: { address: { $id: identifier, ...inner } },
        },
      }).value;
    if (
      identifier === '#address' &&
      (dialect.includes('2019-09') || dialect.includes('2020-12'))
    )
      expect(load).toThrow();
    else expect(load()).toEqual(expected);
  }
});
