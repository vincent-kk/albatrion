import { describe, expect, it } from 'vitest';

import {
  JSONSchemaScanner,
  JSONSchemaScannerAsync,
  createReferenceResolver,
  createReferenceResolverAsync,
} from '../../index';
import type { ReferenceOutcome } from '../../index';

const D04 = 'http://json-schema.org/draft-04/schema#';
const D06 = 'http://json-schema.org/draft-06/schema#';

const scanInert = (schema: any, withResolver: boolean) => {
  const inert: Record<string, boolean> = {};
  new JSONSchemaScanner({
    options: withResolver
      ? { resolveReference: createReferenceResolver(schema) }
      : {},
    visitor: {
      enter(entry) {
        inert[entry.path] = !!entry.inert;
      },
    },
  }).scan(schema);
  return inert;
};

const resolveAll = (schema: any, options: any = {}) => {
  const outcomes: Array<ReferenceOutcome & { path: string }> = [];
  const output = new JSONSchemaScanner({
    options: { resolveReference: createReferenceResolver(schema, options) },
    visitor: {
      exit(entry) {
        for (const o of entry.references ?? [])
          outcomes.push({ ...o, path: entry.path });
      },
    },
  })
    .scan(schema)
    .getValue() as any;
  return { output, outcomes };
};

describe('bounty json-schema resolver probes', () => {
  it('H1 draft-04 embedded resource (id) under 2020-12 root makes contains inert without resolver', () => {
    const schema = {
      $defs: {
        A: {
          $schema: D04,
          id: 'http://x.example/a.json',
          contains: { type: 'string' },
        },
      },
    };
    const withResolver = scanInert(schema, true);
    const without = scanInert(schema, false);
    expect(withResolver['#/$defs/A/contains']).toBe(true);
    expect(without['#/$defs/A/contains']).toBe(true);
  });

  it('H2 draft-06 subschema with only id under draft-04 root is not a resource', () => {
    const schema = {
      $schema: D04,
      definitions: {
        A: {
          $schema: D06,
          id: 'http://x.example/b.json',
          contains: { type: 'string' },
        },
      },
    };
    const withResolver = scanInert(schema, true);
    const without = scanInert(schema, false);
    expect(without['#/definitions/A/contains']).toBe(
      withResolver['#/definitions/A/contains'],
    );
  });

  it('H3 2020-12 copy keeps a non-identifier "id" annotation keyword', () => {
    const schema = {
      $defs: { A: { id: 'user', type: 'string' } },
      properties: { p: { $ref: '#/$defs/A' } },
    };
    const { output } = resolveAll(schema);
    expect(output.properties.p).toEqual({ id: 'user', type: 'string' });
  });

  it('H3b draft-07 copy keeps a non-identifier "$anchor" annotation keyword', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: { A: { $anchor: 'note', type: 'string' } },
      properties: { p: { $ref: '#/definitions/A' } },
    };
    const { output } = resolveAll(schema);
    expect(output.properties.p).toEqual({ $anchor: 'note', type: 'string' });
  });

  it('H4 pointer escapes and percent-encoding resolve', () => {
    for (const baseURI of [undefined, 'https://ex.example/root.json', 'urn:example:root']) {
      const schema = {
        $defs: {
          'a/b': { type: 'string' },
          'c~d': { type: 'number' },
          'e f': { type: 'boolean' },
          'é': { type: 'null' },
          '%': { type: 'integer' },
          '': { type: 'array' },
        },
        properties: {
          p1: { $ref: '#/$defs/a~1b' },
          p2: { $ref: '#/$defs/c~0d' },
          p3: { $ref: '#/$defs/e%20f' },
          p4: { $ref: '#/$defs/%C3%A9' },
          p5: { $ref: '#/$defs/%25' },
          p6: { $ref: '#/$defs/' },
          p7: { $ref: '#/$defs/é' },
        },
      };
      const { output, outcomes } = resolveAll(schema, baseURI ? { baseURI } : {});
      expect({ baseURI, skipped: outcomes.filter((o) => !o.resolved) }).toEqual({
        baseURI,
        skipped: [],
      });
      expect(output.properties.p6).toEqual({ type: 'array' });
    }
  });

  it('H5 nested $id inside a registered resource resolves independent of reference order', () => {
    const types = {
      $id: 'https://ex.example/types.json',
      $defs: {
        Nested: { $id: 'https://ex.example/nested.json', type: 'string' },
      },
    };
    const make = (order: string[]) => ({
      $id: 'https://ex.example/root.json',
      properties: Object.fromEntries(
        order.map((k) => [
          k,
          { $ref: k === 'a' ? 'nested.json' : 'types.json' },
        ]),
      ),
    });
    const first = resolveAll(make(['b', 'a']), {
      resources: { 'https://ex.example/types.json': types },
    });
    const second = resolveAll(make(['a', 'b']), {
      resources: { 'https://ex.example/types.json': types },
    });
    const pick = (r: any) => r.outcomes.find((o: any) => o.path === '#/properties/a');
    expect(pick(first).resolved).toBe(pick(second).resolved);
  });

  it('H5b async resolver does not load a URI that a registered resource embeds', async () => {
    const types = {
      $id: 'https://ex.example/types.json',
      $defs: {
        Nested: { $id: 'https://ex.example/nested.json', type: 'string' },
      },
    };
    const schema = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'nested.json' } },
    };
    const requested: string[] = [];
    const resolver = createReferenceResolverAsync(schema, {
      resources: { 'https://ex.example/types.json': types },
      load: async (uri) => {
        requested.push(uri);
        return undefined;
      },
    });
    const output = (
      await new JSONSchemaScannerAsync({
        options: { resolveReference: resolver },
      }).scan(schema)
    ).getValue() as any;
    expect({ requested, a: output.properties.a }).toEqual({
      requested: [],
      a: { type: 'string' },
    });
  });

  it('H6 resources key with non-normalized spelling', () => {
    const schema = {
      $id: 'https://Ex.Example/root.json',
      properties: { a: { $ref: 'types.json' } },
    };
    const { outcomes } = resolveAll(schema, {
      resources: { 'https://Ex.Example/types.json': { type: 'string' } },
    });
    expect(outcomes[0].resolved).toBe(true);
  });

  it('H7 observe self reference to root from property', () => {
    const schema = {
      type: 'object',
      properties: { a: { $ref: '#' } },
    };
    const { output, outcomes } = resolveAll(schema);
    console.log('H7', JSON.stringify(outcomes), JSON.stringify(output));
  });
});
