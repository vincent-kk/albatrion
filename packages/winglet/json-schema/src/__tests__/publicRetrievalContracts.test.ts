import { expect, it } from 'vitest';

import { createReferenceResolver } from '../index';

it.each([
  'https://example.test/schema#',
  'https://example.test/schema?variant=1',
  'https://user@example.test/schema',
])(
  'treats the retrieval address %s as distinct from the plain address',
  (address) => {
    const schema = {};
    const plain = 'https://example.test/schema';
    const resolver = createReferenceResolver(schema, {
      resources: { [address]: { type: 'string' } },
    });
    expect(
      resolver.resolve(plain, '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped' });
  },
);

it('does not treat a percent-escaped metaschema spelling as an official dialect declaration', () => {
  const schema = {
    $schema: 'https://json-schema.org/draft-0%34/schema',
    id: 'https://example.test/draft4',
    $id: 'https://example.test/default',
  };
  const resolver = createReferenceResolver(schema);
  const context = resolver.root(schema);
  expect(
    resolver.resolve('https://example.test/default', '$ref', context),
  ).toMatchObject({ status: 'resolved' });
  expect(
    resolver.resolve('https://example.test/draft4', '$ref', context),
  ).toMatchObject({ status: 'skipped' });
});
