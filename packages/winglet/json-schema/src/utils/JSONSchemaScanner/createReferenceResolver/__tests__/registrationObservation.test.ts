import { expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';

const retrieval = 'https://xn--0/schema';

it.skipIf(URL.canParse(retrieval))(
  'skips a registered host rejected by URL parsing',
  () => {
    const schema = { $id: 'https://root.example/schema' };
    const uri = 'https://fallback.example/schema';
    const resolver = createReferenceResolver(schema, {
      resources: { [retrieval]: { $id: uri, type: 'string' } },
    });

    expect(resolver.resolve(uri, '$ref', resolver.root(schema))).toEqual({
      status: 'skipped',
      reason: 'unresolved',
      uri,
    });
  },
);

it('reports a duplicate when the first alias changes on its next read', () => {
  const first = { type: 'string' };
  let reads = 0;
  const resources = {
    get 'HTTPS://mirror.example/a'() {
      return ++reads === 1 ? first : { type: 'number' };
    },
    'https://mirror.example/a': first,
  };
  const schema = {};
  const resolver = createReferenceResolver(schema, { resources });

  expect(() =>
    resolver.resolve(
      'https://mirror.example/missing',
      '$ref',
      resolver.root(schema),
    ),
  ).toThrow(expect.objectContaining({ specific: 'duplicate-identifier' }));
});
