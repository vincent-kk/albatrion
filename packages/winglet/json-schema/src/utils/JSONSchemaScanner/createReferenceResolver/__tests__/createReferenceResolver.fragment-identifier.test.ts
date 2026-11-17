import { describe, expect, it, vi } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync/createReferenceResolverAsync';
import { enterChild } from './fixtures/enterChild';

const DRAFT04 = 'http://json-schema.org/draft-04/schema#';
const DRAFT07 = 'http://json-schema.org/draft-07/schema#';
const ROOT = 'https://example.com/root.json';

/** A draft-07 embedded resource whose subschema names the outer document with a fragment. */
const OUTER_NAME_DRAFT07 = {
  $schema: DRAFT07,
  $id: ROOT,
  definitions: {
    e: {
      $id: 'urn:example:e',
      definitions: { a: { $id: ROOT + '#foo', type: 'integer' } },
    },
    b: { type: 'string' },
  },
};

/** The same shape in 2020-12, where an identifier with a non-empty fragment is invalid. */
const OUTER_NAME_2020 = {
  $id: ROOT,
  $defs: {
    e: {
      $id: 'urn:example:e',
      $defs: { a: { $id: ROOT + '#foo', type: 'integer' } },
    },
    b: { type: 'string' },
  },
};

describe('identifiers with a non-empty fragment', () => {
  it('registers a draft-07 name for the outer document without redeclaring it', () => {
    const resolver = createReferenceResolver(OUTER_NAME_DRAFT07);
    expect(
      resolver.resolve(
        ROOT + '#foo',
        '$ref',
        resolver.root(OUTER_NAME_DRAFT07),
      ),
    ).toEqual({
      status: 'resolved',
      uri: 'urn:example:e#/definitions/a',
      target: { type: 'integer' },
    });
  });

  it('resolves references below a draft-07 fragment identifier against the document it names', () => {
    const { e } = OUTER_NAME_DRAFT07.definitions;
    const resolver = createReferenceResolver(OUTER_NAME_DRAFT07);
    const outer = enterChild(
      resolver,
      resolver.root(OUTER_NAME_DRAFT07),
      'definitions',
      e,
    );
    const a = enterChild(resolver, outer, 'definitions', e.definitions.a);
    expect(resolver.resolve('#/definitions/b', '$ref', a)).toEqual({
      status: 'resolved',
      uri: ROOT + '#/definitions/b',
      target: { type: 'string' },
    });
  });

  it('ignores a 2020-12 identifier that names the outer document with a fragment', () => {
    const { e } = OUTER_NAME_2020.$defs;
    const resolver = createReferenceResolver(OUTER_NAME_2020);
    const root = resolver.root(OUTER_NAME_2020);
    expect(resolver.resolve(ROOT + '#foo', '$ref', root)).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
    const outer = enterChild(resolver, root, '$defs', e);
    const a = enterChild(resolver, outer, '$defs', e.$defs.a);
    expect(resolver.resolve('#/$defs/b', '$ref', a)).toEqual({
      status: 'skipped',
      reason: 'unresolved',
      uri: 'urn:example:e#/$defs/b',
    });
  });

  it('keeps a draft-07 name apart from the document a later sibling declares', () => {
    const schema = {
      $schema: DRAFT07,
      definitions: {
        a: { $id: 'urn:example:x#foo', type: 'integer' },
        b: { $id: 'urn:example:x', type: 'string' },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('urn:example:x#foo', '$ref', root)).toMatchObject({
      status: 'resolved',
      target: { type: 'integer' },
    });
    expect(resolver.resolve('urn:example:x', '$ref', root)).toMatchObject({
      status: 'resolved',
      target: { type: 'string' },
    });
  });

  it('declares nothing for a 2020-12 fragment identifier before a sibling declares its document', () => {
    const schema = {
      $defs: {
        a: { $id: 'urn:example:x#foo', type: 'integer' },
        b: { $id: 'urn:example:x', type: 'string' },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('urn:example:x', '$ref', root)).toMatchObject({
      status: 'resolved',
      target: { type: 'string' },
    });
    expect(resolver.resolve('urn:example:x#foo', '$ref', root)).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
  });

  it('names an undeclared document with a draft-07 fragment identifier without declaring it', () => {
    const schema = {
      $schema: DRAFT07,
      $id: ROOT,
      definitions: {
        a: { $id: 'other.json#foo', definitions: { b: { type: 'number' } } },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('other.json#foo', '$ref', root)).toMatchObject({
      status: 'resolved',
      uri: ROOT + '#/definitions/a',
    });
    expect(resolver.resolve('other.json', '$ref', root)).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
    const a = enterChild(resolver, root, 'definitions', schema.definitions.a);
    expect(resolver.resolve('#/definitions/b', '$ref', a)).toEqual({
      status: 'skipped',
      reason: 'unresolved',
      uri: 'https://example.com/other.json#/definitions/b',
    });
  });

  it('consults the document a draft-07 fragment identifier names, whether registered or loaded', async () => {
    const other = 'https://example.com/other.json';
    const schema = {
      $schema: DRAFT07,
      definitions: { a: { $id: other + '#foo', type: 'integer' } },
    };
    const document = { $schema: DRAFT07, definitions: { a: { $id: '#foo' } } };
    const conflict = expect.objectContaining({
      code: 'duplicate-identifier',
      message:
        other +
        '#foo declared at #/definitions/a and ' +
        other +
        '#/definitions/a',
    });
    const synchronous = createReferenceResolver(schema, {
      resources: { [other]: document },
    });
    expect(() =>
      synchronous.resolve(other + '#foo', '$ref', synchronous.root(schema)),
    ).toThrow(conflict);
    const load = vi.fn(async () => document);
    const asynchronous = createReferenceResolverAsync(schema, { load });
    await expect(
      asynchronous.resolve(other + '#foo', '$ref', asynchronous.root(schema)),
    ).rejects.toThrow(conflict);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(other);
  });

  it('addresses a name below two draft-07 fragment identifiers from the nearest declared resource', () => {
    const schema = {
      $schema: DRAFT07,
      $id: ROOT,
      definitions: {
        a: {
          $id: 'other.json#foo',
          definitions: { c: { $id: 'third.json#bar', type: 'integer' } },
        },
      },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('third.json#bar', '$ref', resolver.root(schema)),
    ).toEqual({
      status: 'resolved',
      uri: ROOT + '#/definitions/a/definitions/c',
      target: { type: 'integer' },
    });
  });

  it('finds a draft-07 name by its written document address when that document declares another', () => {
    const schema = {
      $schema: DRAFT07,
      definitions: { a: { $id: 'urn:example:x#foo', type: 'integer' } },
    };
    const resolver = createReferenceResolver(schema, {
      resources: { 'urn:example:x': { $id: 'urn:example:y' } },
    });
    expect(
      resolver.resolve('urn:example:x#foo', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved', target: { type: 'integer' } });
  });

  it('finds a name of a registered document through its retrieval address', () => {
    const schema = { $schema: DRAFT07 };
    const resolver = createReferenceResolver(schema, {
      resources: {
        'urn:example:x': {
          $schema: DRAFT07,
          $id: 'urn:example:y',
          definitions: { b: { $id: '#bar' } },
        },
      },
    });
    expect(
      resolver.resolve('urn:example:x#bar', '$ref', resolver.root(schema)),
    ).toMatchObject({
      status: 'resolved',
      uri: 'urn:example:y#/definitions/b',
    });
  });

  it('declares the named document for an empty identifier below a draft-07 fragment identifier', () => {
    const schema = {
      $schema: DRAFT07,
      $id: ROOT,
      definitions: {
        a: { $id: 'other.json#foo', definitions: { c: { $id: '' } } },
      },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('other.json', '$ref', resolver.root(schema)),
    ).toMatchObject({
      status: 'resolved',
      uri: 'https://example.com/other.json#',
    });
  });

  it('follows the draft-04 example of an identifier with a path and a fragment', () => {
    const schema = {
      $schema: DRAFT04,
      id: 'http://x.y.z/rootschema.json#',
      definitions: {
        schema2: {
          id: 'otherschema.json',
          definitions: {
            alsonested: { id: 't/inner.json#a', type: 'integer' },
          },
        },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(
      resolver.resolve('http://x.y.z/t/inner.json#a', '$ref', root),
    ).toMatchObject({ status: 'resolved', target: { type: 'integer' } });
    expect(
      resolver.resolve('http://x.y.z/t/inner.json', '$ref', root),
    ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
  });

  it('keeps the enclosing base for a 2020-12 identifier with a path and a fragment', () => {
    const schema = {
      $id: ROOT,
      $defs: {
        a: { $id: 'other.json#foo', $defs: { b: { type: 'number' } } },
        b: { type: 'string' },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('other.json', '$ref', root)).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
    const a = enterChild(resolver, root, '$defs', schema.$defs.a);
    expect(resolver.resolve('#/$defs/b', '$ref', a)).toMatchObject({
      status: 'resolved',
      target: { type: 'string' },
    });
  });

  it('rejects one draft-07 name declared at two locations', () => {
    const schema = {
      $schema: DRAFT07,
      $id: ROOT,
      definitions: {
        a: { $id: '#foo' },
        e: {
          $id: 'urn:example:e',
          definitions: { c: { $id: ROOT + '#foo' } },
        },
      },
    };
    expect(() => createReferenceResolver(schema)).toThrow(
      expect.objectContaining({
        code: 'duplicate-identifier',
        message:
          ROOT +
          '#foo declared at #/definitions/a and #/definitions/e/definitions/c',
      }),
    );
  });

  it.each([{}, { $id: 'urn:example:root' }, { $id: ROOT }])(
    'resolves a draft-07 fragment-only name under the root %j',
    (root) => {
      const schema = {
        $schema: DRAFT07,
        ...root,
        definitions: { a: { $id: '#foo', type: 'integer' } },
      };
      const resolver = createReferenceResolver(schema);
      expect(
        resolver.resolve('#foo', '$ref', resolver.root(schema)),
      ).toMatchObject({ status: 'resolved', target: { type: 'integer' } });
    },
  );

  it('ignores a 2020-12 fragment-only $id', () => {
    const schema = { $defs: { a: { $id: '#foo' } } };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('#foo', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
  });
});
