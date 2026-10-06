// filid:contract owned-inline-counts
import { afterEach, expect, it, vi } from 'vitest';

import { type JSONSchema, nodeFromJSONSchema } from '../../index';
import fixtures from './fixtures/ownedInlineMounts.json';

afterEach(() => vi.restoreAllMocks());

/** Expected distinct mount freezes exclude module initialization and include settlement. */
const expectations = [
  { name: 'nested-d5-f4', nodes: 1365, production: 3071, development: 30372 },
  { name: 'flat-500', nodes: 501, production: 1003, development: 11024 },
  { name: 'oneOf-20', nodes: 63, production: 116, development: 1569 },
  { name: 'sample-0', nodes: 3, production: 8, development: 69 },
];

it.each(expectations)(
  'matches the design distinct freeze count for $name',
  async (expected) => {
    const fixture = fixtures.find((row) => row.name === expected.name)!;
    const schema = structuredClone(fixture.schema) as JSONSchema;
    const frozen = vi.spyOn(Object, 'freeze');
    nodeFromJSONSchema({
      jsonSchema: schema,
      validationMode: 0,
      onChange: () => {},
    });
    for (let turn = 0; turn < 64; turn++) await Promise.resolve();
    const values = frozen.mock.calls.map(([value]) => value);
    const distinct = new Set<unknown>();
    let duplicates = 0;
    for (let index = 0; index < values.length; index++) {
      const value = values[index];
      if (distinct.has(value)) duplicates++;
      else distinct.add(value);
    }
    expect(
      values.every(
        (value) =>
          value !== null &&
          (typeof value === 'object' || typeof value === 'function'),
      ),
    ).toBe(true);
    expect(duplicates).toBe(0);
    expect(distinct.size).toBe(
      process.env.NODE_ENV === 'production'
        ? expected.production
        : expected.development,
    );
  },
);
