// filid:contract owned-inline-counts
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { type AuthoredSchema } from '@/schema-form/core/engine/types/jsonSchema';

import { default as fixtures } from './fixtures/ownedInlineMounts.json';

afterEach(() => vi.restoreAllMocks());

/** Mount freeze work is bounded; initialization is excluded and settlement included (400C-02). */
const expectations = [
  { name: 'nested-d5-f4', nodes: 1365, production: 1706, development: 29007 },
  { name: 'flat-500', nodes: 501, production: 502, development: 10523 },
  { name: 'oneOf-20', nodes: 63, production: 111, development: 1564 },
  { name: 'sample-0', nodes: 3, production: 5, development: 66 },
];

it.each(expectations)(
  'bounds the design distinct freeze work for $name',
  async (expected) => {
    const fixture = fixtures.find((row) => row.name === expected.name)!;
    const schema = structuredClone(fixture.schema) as AuthoredSchema;
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
    console.log(
      'OWNED_INLINE_FREEZE_COUNTS',
      JSON.stringify({
        fixture: expected.name,
        mode: process.env.NODE_ENV,
        distinct: distinct.size,
      }),
    );
    expect(distinct.size).toBeLessThanOrEqual(
      process.env.NODE_ENV === 'production'
        ? expected.production
        : expected.development,
    );
  },
);
