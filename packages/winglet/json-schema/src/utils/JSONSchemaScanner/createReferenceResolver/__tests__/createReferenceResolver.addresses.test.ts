import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { assertEquivalent } from './fixtures/assertEquivalent';
import { scan } from './fixtures/scan';

describe('URI and pointer addressing', () => {
  it('distinguishes empty fragment and an empty property token', () => {
    const schema = {
        '': false,
        $defs: { '': { const: 'empty' } },
        type: 'string',
      },
      r = createReferenceResolver(schema),
      c = r.root(schema);
    expect(r.resolve('#/', '$ref', c)).toMatchObject({
      status: 'skipped',
      reason: 'relocation',
      uri: '#/',
    });
    expect(r.resolve('#/$defs/', '$ref', c)).toMatchObject({
      status: 'resolved',
      target: { const: 'empty' },
    });
    expect(r.resolve('#', '$ref', c)).toMatchObject({
      status: 'resolved',
      target: schema,
    });
  });
  it.each([
    ['#%2F$defs%2FA', 'A'],
    ['#/$defs/a~01', 'a~1'],
    ['#/$defs/a~1b', 'a/b'],
    ['#/$defs/a%20b', 'a b'],
    ['#/$defs/%252F', '%2F'],
  ])('decodes %s once before splitting pointer tokens', (reference, key) => {
    const schema = { $defs: { [key]: { const: key } }, $ref: reference };
    expect(scan(schema).output.allOf).toEqual([{ const: key }]);
    assertEquivalent(schema, scan(schema).output, [key, 0, null]);
  });
  it.each(['#/%ZZ', '#/missing', '#/toString', '#%252F$defs%252FA'])(
    'keeps unavailable own targets %s',
    (reference) => {
      const schema = { $defs: { A: false }, $ref: reference };
      expect(scan(schema).outcomes.get('#')).toMatchObject([
        { skipped: 'unresolved' },
      ]);
    },
  );

  it('normalizes retrieval bases before resolving an anonymous document fragment', () => {
    const schema = { $defs: { A: false }, $ref: '#/$defs/A' };
    expect(
      scan(
        schema,
        {},
        { baseURI: 'HTTPS://EXAMPLE.TEST/a/../root.json#retrieval' },
      ).output.allOf,
    ).toEqual([false]);
  });
  it('does not turn a double-slash path into a different authority during relocation', () => {
    const target = {
      $id: 'https://e.test/B',
      properties: { x: { $ref: 'https://e.test//T' } },
    };
    const schema = { $id: 'https://e.test/A', $ref: 'B' };
    const { output } = scan(
      schema,
      { maxDepth: 0 },
      {
        resources: {
          'https://e.test/B': target,
          'https://e.test//T': { type: 'string' },
        },
      },
    );
    const reference = output.allOf[0].properties.x.$ref;
    expect(new URL(reference, 'https://e.test/A').href).toBe(
      'https://e.test//T',
    );
  });
  it.each(['%2F', '#é'])(
    'can resolve its own canonical URI for key %s',
    (key) => {
      const schema = { $defs: { [key]: { const: key } } },
        resolver = createReferenceResolver(schema),
        context = resolver.root(schema);
      const result = resolver.resolve(
        '#/$defs/' + encodeURIComponent(key),
        '$ref',
        context,
      );
      expect(result.status).toBe('resolved');
      if (result.status === 'resolved')
        expect(resolver.resolve(result.uri, '$ref', context)).toMatchObject({
          status: 'resolved',
          target: { const: key },
        });
    },
  );
  it('canonicalizes forward anchors and pointer aliases to one identity', () => {
    const schema = {
      $id: 'https://e.test/root',
      $defs: {
        A: {
          $anchor: 'Node',
          type: 'object',
          properties: { next: { $ref: '#Node' } },
        },
      },
      properties: { use: { $ref: '#/$defs/A' } },
    };
    const { output, outcomes } = scan(schema);
    expect(output.properties.use.properties.next).toEqual({ $ref: '#Node' });
    expect(outcomes.get('#/properties/use/properties/next')).toMatchObject([
      { uri: 'https://e.test/root#/$defs/A', skipped: 'cycle' },
    ]);
    assertEquivalent(schema, output, [
      {},
      { use: {} },
      { use: { next: 1 } },
      { use: { next: {} } },
    ]);
  });
  it('uses lexical resource bases without applying relative identifiers twice', () => {
    const schema = {
      $id: 'https://e.test/base/root.json',
      $defs: {
        A: {
          $id: 'dir/A.json',
          $defs: { B: { type: 'string' } },
          properties: { next: { $ref: '#/$defs/B' } },
        },
      },
      properties: { use: { $ref: 'dir/A.json' } },
    };
    const { output } = scan(schema);
    expect(output.properties.use.properties.next).toEqual({ type: 'string' });
    assertEquivalent(schema, output, [
      { use: { next: 'a' } },
      { use: { next: 2 } },
    ]);
  });
  it('keeps separate host contexts for the same written reference', () => {
    const schema = {
      $id: 'https://e.test/root',
      $defs: {
        A: {
          $id: 'A',
          $defs: { T: { type: 'string' } },
          properties: { x: { $ref: '#/$defs/T' } },
        },
        B: {
          $id: 'B',
          $defs: { T: { type: 'number' } },
          properties: { x: { $ref: '#/$defs/T' } },
        },
      },
      properties: { a: { $ref: 'A' }, b: { $ref: 'B' } },
    };
    const { output } = scan(schema);
    expect(output.properties.a.properties.x.type).toBe('string');
    expect(output.properties.b.properties.x.type).toBe('number');
    assertEquivalent(schema, output, [
      { a: { x: 's' }, b: { x: 1 } },
      { a: { x: 1 }, b: { x: 's' } },
    ]);
  });
  it('indexes registered documents lazily and rejects duplicate identifiers with both paths', () => {
    const r = createReferenceResolver(
      {},
      {
        resources: {
          'https://e.test/doc': {
            $defs: {
              A: { $id: 'https://e.test/same' },
              B: { $id: 'https://e.test/same' },
            },
          },
        },
      },
    );
    expect(() => r.resolve('https://e.test/doc', '$ref', r.root({}))).toThrow(
      /\$defs\/A.*\$defs\/B/,
    );
  });
  it.each([false, true])(
    'rejects duplicate anchors independent of declaration order %s',
    (reverse) => {
      const values = [{ $anchor: 'X' }, { $anchor: 'X' }];
      if (reverse) values.reverse();
      expect(() => createReferenceResolver({ allOf: values })).toThrow(
        /allOf\/0.*allOf\/1/,
      );
    },
  );
  it('accepts same-location aliases and caller metaschema aliases', () => {
    const schema = {
      $schema: 'https://e.test/meta',
      $id: 'https://e.test/root',
      definitions: { A: { $id: '#Node', type: 'string' } },
      properties: { a: { $ref: '#Node' } },
    };
    const { output } = scan(
      schema,
      {},
      { dialects: { 'https://e.test/meta': 'draft-07' } },
    );
    expect(output.properties.a.type).toBe('string');
  });
});
