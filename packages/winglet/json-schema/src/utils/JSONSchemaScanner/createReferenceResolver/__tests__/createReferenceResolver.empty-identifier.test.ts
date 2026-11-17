import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync/createReferenceResolverAsync';

const DRAFT04 = 'http://json-schema.org/draft-04/schema#';
const DRAFT07 = 'http://json-schema.org/draft-07/schema#';
const DRAFT2019 = 'https://json-schema.org/draft/2019-09/schema';

/** Match a duplicate-identifier error by its code and its whole message. */
const duplicate = (message: string) =>
  expect.objectContaining({ code: 'duplicate-identifier', message });

describe('empty subschema identifiers', () => {
  it.each([
    [{}, '', '#'],
    [{}, '#', '#'],
    [{ $id: 'urn:example:root' }, '', 'urn:example:root'],
    [{ $id: 'urn:example:root' }, '#', 'urn:example:root'],
    [{ $id: 'tag:example.com,2024:root' }, '', 'tag:example.com,2024:root'],
    [{ $id: 'tag:example.com,2024:root' }, '#', 'tag:example.com,2024:root'],
    [
      { $id: 'https://example.com/root.json' },
      '',
      'https://example.com/root.json',
    ],
    [
      { $id: 'https://example.com/root.json' },
      '#',
      'https://example.com/root.json',
    ],
  ])(
    'rejects the root %j with the subschema identifier %j',
    (root, $id, uri) => {
      expect(() =>
        createReferenceResolver({ ...root, $defs: { a: { $id } } }),
      ).toThrow(duplicate(uri + ' declared at # and #/$defs/a'));
    },
  );

  it.each([
    'urn:example:root',
    'tag:example.com,2024:root',
    'https://example.com/root.json',
  ])(
    'rejects a subschema identifier that names %s with an empty fragment',
    (uri) => {
      expect(() =>
        createReferenceResolver({ $id: uri, $defs: { a: { $id: uri + '#' } } }),
      ).toThrow(duplicate(uri + ' declared at # and #/$defs/a'));
    },
  );

  it('rejects an empty subschema $id under an opaque baseURI', () => {
    expect(() =>
      createReferenceResolver(
        { $defs: { a: { $id: '' } } },
        { baseURI: 'urn:example:root' },
      ),
    ).toThrow(
      duplicate(
        'urn:example:root declared at urn:example:root# and urn:example:root#/$defs/a',
      ),
    );
  });

  it.each([
    [DRAFT04, { definitions: { a: { id: '' } } }, '#/definitions/a'],
    [DRAFT04, { definitions: { a: { id: '#' } } }, '#/definitions/a'],
    [DRAFT07, { definitions: { a: { $id: '' } } }, '#/definitions/a'],
    [DRAFT07, { definitions: { a: { $id: '#' } } }, '#/definitions/a'],
    [DRAFT2019, { $defs: { a: { $id: '' } } }, '#/$defs/a'],
  ])('rejects an empty identifier in %s at %j', ($schema, body, path) => {
    expect(() => createReferenceResolver({ $schema, ...body })).toThrow(
      duplicate('# declared at # and ' + path),
    );
  });

  it('rejects an empty $id inside an embedded resource', () => {
    const schema = {
      $defs: { a: { $id: 'urn:example:a', $defs: { b: { $id: '' } } } },
    };
    expect(() => createReferenceResolver(schema)).toThrow(
      duplicate('urn:example:a declared at #/$defs/a and #/$defs/a/$defs/b'),
    );
  });

  it('rejects an empty $id in a registered document when it is first used', () => {
    const schema = { $ref: 'urn:example:other' };
    const resolver = createReferenceResolver(schema, {
      resources: { 'urn:example:other': { $defs: { a: { $id: '' } } } },
    });
    expect(() =>
      resolver.resolve('urn:example:other', '$ref', resolver.root(schema)),
    ).toThrow(
      duplicate(
        'urn:example:other declared at urn:example:other# and urn:example:other#/$defs/a',
      ),
    );
  });

  it('rejects an empty $id in a loaded document', async () => {
    const schema = { $ref: 'urn:example:other' };
    const resolver = createReferenceResolverAsync(schema, {
      load: async () => ({ $defs: { a: { $id: '' } } }),
    });
    await expect(
      resolver.resolve('urn:example:other', '$ref', resolver.root(schema)),
    ).rejects.toThrow(
      duplicate(
        'urn:example:other declared at urn:example:other# and urn:example:other#/$defs/a',
      ),
    );
  });

  it.each([
    {},
    { baseURI: 'urn:example:root' },
    { baseURI: 'https://example.com/root.json' },
  ])('accepts an empty root identifier with the options %j', (options) => {
    expect(() => createReferenceResolver({ $id: '' }, options)).not.toThrow();
  });

  it('ignores empty identifiers inside data keywords', () => {
    const schema = {
      const: { $id: '' },
      default: { $id: '' },
      enum: [{ $id: '' }],
      examples: [{ $id: '' }],
    };
    expect(() => createReferenceResolver(schema)).not.toThrow();
  });

  it('accepts a fragment-only subschema $id', () => {
    expect(() =>
      createReferenceResolver({ $defs: { a: { $id: '#foo' } } }),
    ).not.toThrow();
  });
});
