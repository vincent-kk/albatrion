import { describe, expect, it, vi } from 'vitest';

import { JSONSchemaScannerAsync } from '../../async';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';
import { scan } from './fixtures/scan';

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
  it.each([
    [['nested', 'types']],
    [['types', 'nested']],
  ] as Array<[Array<'nested' | 'types'>]>)(
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
});
