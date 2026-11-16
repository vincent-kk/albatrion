import { describe, expect, it, vi } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';
import { scan } from './fixtures/scan';

const RECURSIVE = 'https://json-schema.org/draft/2019-09/schema';

describe('empty same-document references', () => {
  it('resolves an empty reference to the same boolean root as #', () => {
    const resolver = createReferenceResolver(false);
    const context = resolver.root(false);
    expect(resolver.resolve('', '$ref', context)).toEqual({
      status: 'resolved',
      uri: '#',
      target: false,
    });
    expect(resolver.resolve('', '$ref', context)).toEqual(
      resolver.resolve('#', '$ref', context),
    );
    expect(resolver.resolve('other.json', '$ref', context)).toEqual({
      status: 'skipped',
      reason: 'unresolved',
    });
  });

  it('preserves an empty self-reference as a cycle under strict resolution', () => {
    const schema = { $ref: '' };
    const { output, outcomes } = scan(schema, { unresolvedReference: 'throw' });
    expect(output).toEqual(schema);
    expect(outcomes.get('#')).toContainEqual(
      expect.objectContaining({ uri: '#', skipped: 'cycle' }),
    );
  });

  it.each(['urn:example:root', 'tag:example.com,2024:root'])(
    'resolves an empty reference like # under the opaque base %s',
    (id) => {
      const schema = { $id: id, $ref: '' };
      const resolver = createReferenceResolver(schema);
      const context = resolver.root(schema);
      expect(resolver.resolve('', '$ref', context)).toEqual(
        resolver.resolve('#', '$ref', context),
      );
      expect(resolver.resolve('', '$dynamicRef', context)).toEqual(
        resolver.resolve('#', '$dynamicRef', context),
      );
      const empty = scan(schema, { unresolvedReference: 'throw' });
      const hash = scan(
        { $id: id, $ref: '#' },
        { unresolvedReference: 'throw' },
      );
      expect(empty.outcomes.get('#')).toEqual(
        hash.outcomes
          .get('#')!
          .map((outcome) => ({ ...outcome, reference: '' })),
      );
    },
  );

  it('resolves an empty asynchronous reference without loading a document', async () => {
    const load = vi.fn();
    const resolver = createReferenceResolverAsync(false, { load });
    expect(await resolver.resolve('', '$ref', resolver.root(false))).toEqual({
      status: 'resolved',
      uri: '#',
      target: false,
    });
    expect(load).not.toHaveBeenCalled();
  });

  it('resolves an empty asynchronous reference under an opaque base without loading it', async () => {
    const root = { $id: 'urn:example:root', type: 'object' };
    const load = vi.fn();
    const resolver = createReferenceResolverAsync(root, { load });
    const context = resolver.root(root);
    const empty = await resolver.resolve('', '$ref', context);
    expect(empty).not.toMatchObject({ reason: 'unresolved' });
    expect(empty).toEqual(await resolver.resolve('#', '$ref', context));
    expect(load).not.toHaveBeenCalled();
  });

  it('uses an opaque baseURI as the root address', () => {
    const schema = { $defs: { a: { type: 'string' } } };
    const resolver = createReferenceResolver(schema, {
      baseURI: 'urn:example:root',
    });
    const context = resolver.root(schema);
    expect(resolver.resolve('#/$defs/a', '$ref', context)).toMatchObject({
      status: 'resolved',
      uri: 'urn:example:root#/$defs/a',
    });
    expect(
      resolver.resolve('urn:example:root#/$defs/a', '$ref', context),
    ).toEqual(resolver.resolve('#/$defs/a', '$ref', context));
    expect(resolver.resolve('', '$ref', context)).toEqual(
      resolver.resolve('#', '$ref', context),
    );
  });

  it.each([
    {},
    { $id: 'urn:example:root' },
    { $id: 'https://example.com/root.json' },
  ])('reports an empty recursiveRef as invalid under %j', (root) => {
    const schema = {
      ...root,
      $schema: RECURSIVE,
      properties: { a: { $recursiveRef: '' } },
    };
    const { outcomes } = scan(schema, { unresolvedReference: 'throw' });
    expect(outcomes.get('#/properties/a')).toMatchObject([
      { skipped: 'invalid' },
    ]);
  });

  it.each([{}, { $id: 'urn:example:root' }])(
    'rewrites a copied empty reference like # under %j',
    (root) => {
      const build = (reference: string) => ({
        ...root,
        properties: { x: { $ref: '#/$defs/t' } },
        $defs: {
          t: {
            properties: {
              self: { $ref: reference },
              inner: { $id: 'https://example.com/inner.json' },
            },
          },
        },
      });
      const empty = scan(build(''), { maxDepth: 1 }).output;
      const hash = scan(build('#'), { maxDepth: 1 }).output;
      expect(empty.properties.x).not.toHaveProperty('$ref');
      expect(empty.properties.x).toEqual(hash.properties.x);
    },
  );
});

describe('empty references the URL parser accepts', () => {
  it('keeps an empty subschema $id under a hierarchical base as a duplicate identifier', () => {
    const schema = {
      $id: 'https://example.com/root.json',
      $defs: { a: { $id: '' } },
    };
    expect(() => createReferenceResolver(schema)).toThrow(
      /root\.json declared at # and #\/\$defs\/a/,
    );
  });

  it('keeps the relative spelling of an empty reference copied from another document', () => {
    const schema = {
      $id: 'https://example.com/root.json',
      $ref: 'other.json#/$defs/t',
    };
    const other = { $defs: { t: { properties: { self: { $ref: '' } } } } };
    const { output } = scan(
      schema,
      { maxDepth: 0 },
      { resources: { 'https://example.com/other.json': other } },
    );
    expect(output.allOf[0].properties.self).toEqual({ $ref: 'other.json' });
  });
});
