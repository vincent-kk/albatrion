import { describe, expect, it, vi } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';
import { enterChild } from './fixtures/enterChild';

/** A relative embedded resource beside a root definition of the same pointer. */
const RELATIVE_RESOURCE = {
  $defs: {
    a: { $id: 'other.json', $defs: { b: { type: 'number' } } },
    b: { type: 'string' },
  },
};

const ROOTS = [
  {},
  { $id: 'urn:example:root' },
  { $id: 'https://example.com/root.json' },
];

describe('references and identifiers under an unknown, relative or opaque base', () => {
  it('addresses a relative $id inside an anonymous document by its relative address', () => {
    const { a } = RELATIVE_RESOURCE.$defs;
    const resolver = createReferenceResolver(RELATIVE_RESOURCE);
    const root = resolver.root(RELATIVE_RESOURCE);
    expect(resolver.resolve('other.json', '$ref', root)).toEqual({
      status: 'skipped',
      reason: 'relocation',
      uri: 'other.json#',
    });
    const inner = enterChild(resolver, root, '$defs', a);
    expect(resolver.resolve('#/$defs/b', '$ref', inner)).toEqual({
      status: 'resolved',
      uri: 'other.json#/$defs/b',
      target: { type: 'number' },
    });
  });

  it('resolves a relative $id against an opaque root identifier', () => {
    const schema = { $id: 'urn:example:root', ...RELATIVE_RESOURCE };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('other.json', '$ref', root)).toMatchObject({
      status: 'resolved',
      uri: 'urn:other.json#',
    });
    const inner = enterChild(resolver, root, '$defs', schema.$defs.a);
    expect(resolver.resolve('#/$defs/b', '$ref', inner)).toMatchObject({
      status: 'resolved',
      target: { type: 'number' },
    });
  });

  it('rejects one relative $id declared twice in an anonymous document', () => {
    const schema = {
      $defs: { a: { $id: 'other.json' }, b: { $id: 'other.json' } },
    };
    expect(() => createReferenceResolver(schema)).toThrow(
      expect.objectContaining({
        code: 'duplicate-identifier',
        message: 'other.json declared at #/$defs/a and #/$defs/b',
      }),
    );
  });

  it('uses a relative root $id as the root address', () => {
    const schema = { $id: 'schemas/root.json', $defs: { b: {} } };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('#/$defs/b', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved', uri: 'schemas/root.json#/$defs/b' });
  });

  it('uses a relative baseURI as the root address', () => {
    const schema = { $defs: { b: {} } };
    const resolver = createReferenceResolver(schema, {
      baseURI: 'schemas/root.json',
    });
    expect(
      resolver.resolve('#/$defs/b', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved', uri: 'schemas/root.json#/$defs/b' });
  });

  it('keeps an absolute $id under a relative baseURI', () => {
    const schema = {
      $defs: {
        a: { $id: 'urn:example:a', $defs: { b: { type: 'number' } } },
      },
    };
    const resolver = createReferenceResolver(schema, {
      baseURI: 'schemas/root.json',
    });
    const inner = enterChild(
      resolver,
      resolver.root(schema),
      '$defs',
      schema.$defs.a,
    );
    expect(resolver.resolve('#/$defs/b', '$ref', inner)).toMatchObject({
      status: 'resolved',
      target: { type: 'number' },
    });
  });

  it('resolves a relative $ref against an opaque base to a registered document', () => {
    const schema = { $id: 'urn:example:root', $ref: 'child.json' };
    const resolver = createReferenceResolver(schema, {
      resources: { 'urn:child.json': { type: 'string' } },
    });
    expect(
      resolver.resolve('child.json', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved', target: { type: 'string' } });
  });

  it('does not load a document whose address stays relative', async () => {
    const schema = { type: 'object' };
    const load = vi.fn();
    const resolver = createReferenceResolverAsync(schema, { load });
    expect(
      await resolver.resolve('other.json', '$ref', resolver.root(schema)),
    ).toEqual({ status: 'skipped', reason: 'unresolved', uri: 'other.json' });
    expect(load).not.toHaveBeenCalled();
  });

  it('loads a relative document resolved against an opaque base', async () => {
    const schema = { $id: 'urn:example:root' };
    const load = vi.fn();
    const resolver = createReferenceResolverAsync(schema, { load });
    await resolver.resolve('child.json', '$ref', resolver.root(schema));
    expect(load.mock.calls).toEqual([['urn:child.json']]);
  });

  it('does not look up a registered document by a relative key', () => {
    const schema = { type: 'object' };
    const resolver = createReferenceResolver(schema, {
      resources: { 'other.json': { type: 'string' } },
    });
    expect(
      resolver.resolve('other.json', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
  });

  it.each(ROOTS)('never reads a space reference as empty under %j', (root) => {
    const resolver = createReferenceResolver(root);
    expect(resolver.resolve(' ', '$ref', resolver.root(root))).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
  });

  it.each(ROOTS)('never reads a space identifier as empty under %j', (root) => {
    expect(() =>
      createReferenceResolver({ ...root, $defs: { a: { $id: ' ' } } }),
    ).not.toThrow();
  });

  it.each(ROOTS)(
    'keeps a leading space in front of a pointer under %j',
    (root) => {
      const schema = { ...root, $defs: { b: {} } };
      const resolver = createReferenceResolver(schema);
      expect(
        resolver.resolve(' #/$defs/b', '$ref', resolver.root(schema)),
      ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
    },
  );

  it('keeps a backslash instead of reading it as a path separator', () => {
    const schema = { $id: 'https://example.com/root.json' };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('sub\\b.json', '$ref', resolver.root(schema)),
    ).toEqual({
      status: 'skipped',
      reason: 'unresolved',
      uri: 'https://example.com/sub%5Cb.json',
    });
  });

  it('preserves a reference that copies from a relative resource into another resource', () => {
    const schema = {
      $defs: {
        r: {
          $id: 'other.json',
          $defs: {
            t: { properties: { x: { $ref: '#/$defs/u' } } },
            u: { type: 'number' },
          },
        },
      },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('other.json#/$defs/t', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'relocation' });
  });
});
