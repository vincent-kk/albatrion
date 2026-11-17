import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { assertEquivalent } from './fixtures/assertEquivalent';
import { scan } from './fixtures/scan';

const modern = 'https://json-schema.org/draft/2020-12/schema';
const old = 'http://json-schema.org/draft-07/schema#';
const recursive = 'https://json-schema.org/draft/2019-09/schema';

describe('complete template preparation', () => {
  it.each(['2019-09', '2020-12'] as const)(
    'applies reference siblings as conjunctions in %s',
    (dialect) => {
      const schema = {
        $schema: 'https://json-schema.org/draft/' + dialect + '/schema',
        $defs: { T: { type: 'string', minLength: 1 } },
        properties: {
          x: { $ref: '#/$defs/T', minLength: 3, description: 'retained' },
        },
      };
      const { output } = scan(schema);
      expect(output.properties.x).toEqual({
        minLength: 3,
        description: 'retained',
        allOf: [{ type: 'string', minLength: 1 }],
      });
      assertEquivalent(
        schema,
        output,
        [{ x: 'a' }, { x: 'abc' }, { x: 1 }],
        dialect,
      );
    },
  );
  it('rewrites unvisited descendants at maxDepth one into their original resource', () => {
    const B = {
      $id: 'https://e.test/B',
      $defs: { S: { type: 'string' } },
      type: 'object',
      properties: { x: { $ref: '#/$defs/S' } },
    };
    const schema = {
      $id: 'https://e.test/A',
      properties: { use: { $ref: 'B' } },
    };
    const { output } = scan(
      schema,
      { maxDepth: 1 },
      { resources: { 'https://e.test/B': B } },
    );
    expect(output.properties.use.properties.x.$ref).toBe('B#/$defs/S');
    assertEquivalent(
      schema,
      output,
      [{ use: { x: 's' } }, { use: { x: 1 } }],
      '2020-12',
      [B],
    );
  });
  it('removes copied identifiers for repeated targets without mutating the source', () => {
    const B = {
      $id: 'https://e.test/B',
      $anchor: 'Node',
      type: 'string',
      default: { $id: 'data', $ref: '#literal' },
    };
    const schema = {
      $id: 'https://e.test/A',
      properties: { a: { $ref: 'B' }, b: { $ref: 'B' } },
    };
    const { output } = scan(
      schema,
      {},
      { resources: { 'https://e.test/B': B } },
    );
    expect(output.properties.a).toEqual({ type: 'string', default: B.default });
    expect(output.properties.a).not.toBe(output.properties.b);
    expect(B.$id).toBe('https://e.test/B');
    assertEquivalent(
      schema,
      output,
      [{ a: 's', b: 't' }, { a: 1 }],
      '2020-12',
      [B],
    );
  });
  it('preserves mixed-dialect boundaries and compares the embedded resource separately', () => {
    const child = {
      $id: 'child',
      $schema: old,
      items: [{ type: 'string' }],
      additionalItems: false,
    };
    const B = {
      $schema: modern,
      $id: 'https://e.test/B',
      properties: { x: child },
    };
    const originalChild = JSON.parse(JSON.stringify(child));
    const originalB = JSON.stringify(B);
    const schema = { $schema: modern, $id: 'https://e.test/A', $ref: 'B' };
    const { output, outcomes } = scan(
      schema,
      {},
      { resources: { 'https://e.test/B': B } },
    );
    expect(output).toEqual(schema);
    expect(outcomes.get('#')).toMatchObject([{ skipped: 'relocation' }]);
    expect(JSON.stringify(B)).toBe(originalB);
    assertEquivalent(
      originalChild,
      B.properties.x,
      [['s'], ['s', 2], [1]],
      'draft-07',
    );
  });
  it('can erase same-dialect embedded resource boundaries', () => {
    const B = {
      $schema: modern,
      $id: 'https://e.test/B',
      properties: { x: { $id: 'child', $schema: modern, type: 'string' } },
    };
    const schema = { $schema: modern, $id: 'https://e.test/A', $ref: 'B' };
    const { output } = scan(
      schema,
      {},
      { resources: { 'https://e.test/B': B } },
    );
    expect(output.allOf[0].properties.x).toEqual({ type: 'string' });
    assertEquivalent(schema, output, [{ x: 's' }, { x: 2 }], '2020-12', [B]);
  });
  it.each(['depth', 'filter', 'definition'])(
    'keeps cross-resource recursive references before %s can hide descendants',
    (mode) => {
      const B = {
        $schema: recursive,
        $id: 'https://e.test/B',
        type: 'object',
        ...(mode === 'definition'
          ? { $defs: { N: { $recursiveRef: '#' } } }
          : { properties: { next: { $recursiveRef: '#' } } }),
      };
      const schema = { $schema: recursive, $id: 'https://e.test/A', $ref: 'B' };
      const options =
        mode === 'depth'
          ? { maxDepth: 0 }
          : mode === 'filter'
            ? { filter: (e: any) => e.depth === 0 }
            : {};
      const { output, outcomes } = scan(schema, options, {
        resources: { 'https://e.test/B': B },
      });
      expect(outcomes.get('#')).toMatchObject([{ skipped: 'relocation' }]);
      assertEquivalent(
        schema,
        output,
        [{}, { next: {} }, { next: 1 }],
        '2019-09',
        [B],
      );
    },
  );
  it.each(['$dynamicAnchor', '$recursiveAnchor'])(
    'does not erase a %s resource boundary',
    (key) => {
      const dialect = key === '$dynamicAnchor' ? modern : recursive;
      const B = {
        $schema: dialect,
        $id: 'https://e.test/B',
        [key]: key === '$dynamicAnchor' ? 'Node' : true,
        type: 'string',
      };
      const schema = { $schema: dialect, $id: 'https://e.test/A', $ref: 'B' };
      expect(
        scan(schema, {}, { resources: { 'https://e.test/B': B } }).outcomes.get(
          '#',
        ),
      ).toMatchObject([{ skipped: 'relocation' }]);
    },
  );
  it('does not invent a base URI for an anonymous relative document reference', () => {
    const schema = { $ref: 'other.json' };
    expect(scan(schema).outcomes.get('#')).toMatchObject([
      { skipped: 'unresolved' },
    ]);
  });
});

describe('old dialect sibling address preservation', () => {
  it.each([0, 10])(
    'keeps recursive definitions at maximum depth %s',
    (maxDepth) => {
      const schema = {
        $schema: old,
        $ref: '#/definitions/A',
        definitions: {
          A: {
            type: 'object',
            properties: { next: { $ref: '#/definitions/A' } },
          },
        },
      };
      const { output } = scan(schema, { maxDepth });
      expect(output.definitions).toEqual(schema.definitions);
      assertEquivalent(
        schema,
        output,
        [{}, { next: {} }, { next: 1 }],
        'draft-07',
      );
    },
  );

  it('keeps the old root identifier and recursive address container in async output', async () => {
    const { JSONSchemaScannerAsync } = await import('../../async');
    const { createReferenceResolverAsync } = await import(
      '../utils/createReferenceResolverAsync'
    );
    const schema = {
      $schema: old,
      $id: 'https://e.test/root',
      $ref: '#/definitions/A',
      definitions: {
        A: {
          type: 'object',
          properties: { next: { $ref: '#/definitions/A' } },
        },
      },
    };
    const scanner = new JSONSchemaScannerAsync({
      options: {
        maxDepth: 0,
        resolveReference: createReferenceResolverAsync(schema, {
          baseURI: 'https://e.test/root',
        }),
      },
    });
    const output = (await scanner.scan(schema)).getValue()!;
    assertEquivalent(
      schema,
      output,
      [{}, { next: {} }, { next: 1 }],
      'draft-07',
    );
  });
  it('blocks an ignored properties container instead of deleting its address', () => {
    const schema = {
      $schema: old,
      $ref: '#/properties/A',
      properties: {
        A: { type: 'object', properties: { next: { $ref: '#/properties/A' } } },
      },
    };
    const { output, outcomes } = scan(schema);
    expect(outcomes.get('#')).toMatchObject([{ skipped: 'relocation' }]);
    assertEquivalent(
      schema,
      output,
      [{}, { next: {} }, { next: 1 }],
      'draft-07',
    );
  });
  it('blocks boolean additionalProperties and drops only non-schema annotations', () => {
    const schema = {
      $schema: old,
      definitions: { A: { type: 'string' } },
      properties: {
        a: { $ref: '#/definitions/A', additionalProperties: false },
        b: {
          $ref: '#/definitions/A',
          title: 'ignored',
          description: 'ignored',
        },
      },
    };
    const { output } = scan(schema);
    expect(output.properties.a).toEqual(schema.properties.a);
    expect(output.properties.b).toEqual({ type: 'string' });
    assertEquivalent(
      schema,
      output,
      [
        { a: 'a', b: 'b' },
        { a: 1, b: 2 },
      ],
      'draft-07',
    );
  });
  it('ignores and drops a sibling identifier without applying it as a base', () => {
    const schema = {
      $schema: old,
      $id: 'https://e.test/root',
      definitions: { A: { type: 'string' } },
      properties: {
        a: { $ref: '#/definitions/A', $id: 'https://else.test/ignored' },
      },
    };
    const { output } = scan(schema);
    expect(output.properties.a).toEqual({ type: 'string' });
    const before = new Ajv({
      strict: false,
      schemaId: 'id',
      validateSchema: false,
    }).compile(schema);
    const after = new Ajv({
      strict: false,
      schemaId: 'id',
      validateSchema: false,
    }).compile(output);
    expect([after({ a: 'a' }), after({ a: 2 })]).toEqual([
      before({ a: 'a' }),
      before({ a: 2 }),
    ]);
  });
  it('does not index an anchor inside an inert non-definition sibling', () => {
    const schema = {
      $schema: old,
      $ref: '#Node',
      properties: { a: { $id: '#Node', type: 'string' } },
    };
    expect(scan(schema).outcomes.get('#')).toMatchObject([
      { skipped: 'unresolved' },
    ]);
  });
});
