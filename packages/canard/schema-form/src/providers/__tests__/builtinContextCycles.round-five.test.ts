import { expect, it } from 'vitest';

import { areContextsEqual } from '../hooks/contextSnapshot/utils/areContextsEqual';

it.each([
  ['error', (value: number) => new Error(String(value))],
  ['buffer', (value: number) => new Uint8Array([value]).buffer],
  [
    'data-view',
    (value: number) => new DataView(new Uint8Array([value]).buffer),
  ],
  ['typed-array', (value: number) => new Uint8Array([value, 2])],
  ['number-box', (value: number) => Object(value)],
  ['string-box', (value: number) => Object(String(value))],
  ['boolean-box', (value: number) => Object(value === 1)],
] as const)(
  'the %s own-property graph uses the same bounded comparison as an ordinary graph',
  (_name, create) => {
    expect(areContextsEqual(create(1), create(2))).toBe(false);
    expect(
      areContextsEqual(
        Object.defineProperty(create(1), 'hidden', { value: 1 }),
        Object.defineProperty(create(1), 'hidden', { value: 2 }),
      ),
    ).toBe(true);
    let reads = 0;
    const make = (value: number) => {
      const graph = { value };
      Object.defineProperty(graph, 'self', {
        enumerable: true,
        get() {
          if (++reads > 1000) throw new Error('unbounded context comparison');
          return graph;
        },
      });
      return Object.defineProperty(create(1), 'graph', {
        enumerable: true,
        value: graph,
      });
    };
    expect(areContextsEqual(make(1), make(1))).toBe(
      areContextsEqual({ value: 1 }, { value: 1 }),
    );
    expect(areContextsEqual(make(1), make(2))).toBe(
      areContextsEqual({ value: 1 }, { value: 2 }),
    );
    expect(reads).toBeLessThan(100);
  },
);
