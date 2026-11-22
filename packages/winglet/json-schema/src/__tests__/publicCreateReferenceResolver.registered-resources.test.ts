import { describe, expect, it, vi } from 'vitest';

import { JSONSchemaScannerAsync } from '../index';
import { JSONSchemaScanError } from '../index';
import { JSONSchemaScanErrorCode } from '../index';
import { createReferenceResolverAsync } from '../index';
import { scan } from '../utils/JSONSchemaScanner/createReferenceResolver/__tests__/fixtures/scan';

const types = {
  $id: 'https://ex.example/types.json',
  $defs: {
    Nested: { $id: 'https://ex.example/nested.json', type: 'string' },
  },
};

/** Root whose properties refer to the embedded and the registered address in the given order. */
const rootReferring = (order: Array<'nested' | 'types'>) => ({
  $id: 'https://ex.example/root.json',
  properties: Object.fromEntries(
    order.map((name) => [name, { $ref: name + '.json' }]),
  ),
});

describe('registered resources', () => {
  it.each([[['nested', 'types']], [['types', 'nested']]] as Array<
    [Array<'nested' | 'types'>]
  >)(
    'resolves an identifier embedded in a registered document regardless of reference order %j',
    (order) => {
      const schema = rootReferring(order);
      const { output, outcomes } = scan(
        schema,
        {},
        { resources: { 'https://ex.example/types.json': types } },
      );
      expect(outcomes.get('#/properties/nested')?.[0]).toMatchObject({
        resolved: true,
        uri: 'https://ex.example/nested.json#',
      });
      expect(output.properties!.nested).toEqual({ type: 'string' });
    },
  );

  it('does not load an address that a registered document embeds', async () => {
    const schema = rootReferring(['nested']);
    const load = vi.fn(async () => undefined);
    const scanner = new JSONSchemaScannerAsync({
      options: {
        resolveReference: createReferenceResolverAsync(schema, {
          resources: { 'https://ex.example/types.json': types },
          load,
        }),
      },
    });
    const output = (await scanner.scan(schema)).getValue<typeof schema>()!;
    expect(load).not.toHaveBeenCalled();
    expect(output.properties.nested).toEqual({ type: 'string' });
  });

  it('rejects an identifier two registered documents declare once a lookup names no registration', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'missing.json' } },
    };
    const twin = (uri: string) => ({
      $id: uri,
      $defs: { T: { $id: 'https://ex.example/shared.json' } },
    });
    expect(() =>
      scan(
        schema,
        {},
        {
          resources: {
            'https://ex.example/a.json': twin('https://ex.example/a.json'),
            'https://ex.example/b.json': twin('https://ex.example/b.json'),
          },
        },
      ),
    ).toThrow('https://ex.example/shared.json declared at');
  });

  it.each([
    ['embedding document first', ['a', 'b']],
    ['embedded document first', ['b', 'a']],
  ])(
    'rejects a registered document whose address another registered document embeds, %s',
    (_order, keys) => {
      const schema = {
        $id: 'https://ex.example/root.json',
        properties: { a: { $ref: 'missing.json' } },
      };
      const documents: Record<string, object> = {
        a: {
          $id: 'https://ex.example/a.json',
          $defs: { B: { $id: 'https://ex.example/b.json', type: 'string' } },
        },
        b: { $id: 'https://ex.example/b.json', type: 'number' },
      };
      const resources = Object.fromEntries(
        keys.map((key) => [
          'https://ex.example/' + key + '.json',
          documents[key],
        ]),
      );
      expect(() => scan(schema, {}, { resources })).toThrow(
        'https://ex.example/b.json declared at',
      );
    },
  );

  it.each([
    ['embedding document first', ['a', 'b'], 'https://ex.example/b.json'],
    ['embedded document first', ['b', 'a'], 'https://ex.example/b.json'],
    [
      'embedding document first, upper-case key',
      ['a', 'b'],
      'https://EX.example/b.json',
    ],
    [
      'embedding document first, upper-case key after an upper-case lookup',
      ['c', 'a', 'b'],
      'https://EX.example/b.json',
    ],
  ])(
    'rejects a referenced registered document whose address another referenced one embeds, %s',
    (_order, names, bKey) => {
      const schema = {
        $id: 'https://ex.example/root.json',
        properties: Object.fromEntries(
          names.map((name) => [name, { $ref: name + '.json' }]),
        ),
      };
      const resources = {
        'https://ex.example/a.json': {
          $id: 'https://ex.example/a.json',
          $defs: { B: { $id: 'https://ex.example/b.json', type: 'string' } },
        },
        [bKey]: { $id: 'https://ex.example/b.json', type: 'number' },
        'https://EX.example/c.json': { type: 'boolean' },
      };
      expect(() => scan(schema, {}, { resources })).toThrow(
        'https://ex.example/b.json declared at',
      );
    },
  );

  it('gives the same outcome for one set of resources in every reference order and lookup history', () => {
    const resources = {
      'https://ex.example/a.json': {
        $id: 'https://ex.example/a.json',
        $defs: { B: { $id: 'https://ex.example/b.json', type: 'string' } },
      },
      'https://EX.example/b.json': {
        $id: 'https://ex.example/b.json',
        type: 'number',
      },
      'https://EX.example/c.json': { type: 'boolean' },
    };
    const outcome = (names: string[]) => {
      const schema = {
        $id: 'https://ex.example/root.json',
        properties: Object.fromEntries(
          names.map((name) => [name, { $ref: name + '.json' }]),
        ),
      };
      try {
        return JSON.stringify(scan(schema, {}, { resources }).output);
      } catch (error) {
        return error instanceof JSONSchemaScanError ? error.code : error;
      }
    };
    const histories = [
      ['a', 'b'],
      ['b', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
      ['a', 'c', 'b'],
      ['b', 'c', 'a'],
      ['a', 'b', 'c'],
      ['b', 'a', 'c'],
    ];
    expect(histories.map(outcome)).toEqual(
      histories.map(() => JSONSchemaScanErrorCode.DuplicateIdentifier),
    );
  });

  it('indexes the registered documents once however many lookups miss', () => {
    let reads = 0;
    const document = {
      $id: 'https://ex.example/counted.json',
      get properties() {
        reads++;
        return { x: { type: 'string' } };
      },
    };
    const readsFor = (missing: string[]) => {
      reads = 0;
      scan(
        {
          $id: 'https://ex.example/root.json',
          properties: Object.fromEntries(
            missing.map((name) => [name, { $ref: name + '.json' }]),
          ),
        },
        {},
        { resources: { 'https://ex.example/counted.json': document } },
      );
      return reads;
    };
    const once = readsFor(['missing']);
    expect(once).toBeGreaterThan(0);
    expect(readsFor(['missing', 'other', 'third'])).toBe(once);
  });

  it('finds a registration whose key spells the scheme and host in another case', () => {
    const schema = {
      $id: 'https://Ex.Example/root.json',
      properties: { a: { $ref: 'types.json' } },
    };
    const { output, outcomes } = scan(
      schema,
      {},
      { resources: { 'HTTPS://Ex.Example/types.json': { type: 'string' } } },
    );
    expect(outcomes.get('#/properties/a')?.[0]).toMatchObject({
      resolved: true,
      uri: 'https://ex.example/types.json#',
    });
    expect(output.properties!.a).toEqual({ type: 'string' });
  });

  it('accepts two spellings of one address that register the same document', () => {
    const document = { type: 'string' };
    const schema = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'types.json' } },
    };
    const { outcomes } = scan(
      schema,
      {},
      {
        resources: {
          'https://EX.example/types.json': document,
          'https://ex.EXAMPLE/types.json': document,
        },
      },
    );
    expect(outcomes.get('#/properties/a')?.[0]).toMatchObject({
      resolved: true,
    });
  });

  it('rejects two spellings of one address that register different documents', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'types.json' } },
    };
    expect(() =>
      scan(
        schema,
        {},
        {
          resources: {
            'https://EX.example/types.json': { type: 'string' },
            'https://ex.EXAMPLE/types.json': { type: 'number' },
          },
        },
      ),
    ).toThrow(
      'https://ex.example/types.json declared at https://EX.example/types.json and https://ex.EXAMPLE/types.json',
    );
  });
});
