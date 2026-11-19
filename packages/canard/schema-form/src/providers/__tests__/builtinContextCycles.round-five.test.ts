import { expect, it } from 'vitest';
import { areContextsEqual } from '../hooks/contextSnapshot/utils/areContextsEqual';

it.each([
  ['error', () => new Error('message')],
  ['buffer', () => new ArrayBuffer(2)],
  ['data-view', () => new DataView(new ArrayBuffer(2))],
  ['typed-array', () => new Uint8Array([1, 2])],
  ['number-box', () => Object(1)],
  ['string-box', () => Object('same')],
  ['boolean-box', () => Object(true)],
] as const)('the %s own-property graph uses the same bounded comparison as an ordinary graph', (_name, create) => {
  let reads = 0;
  const make = (value: number) => {
    const graph = { value };
    Object.defineProperty(graph, 'self', { enumerable: true, get() { if (++reads > 1000) throw new Error('unbounded context comparison');return graph; } });
    return Object.defineProperty(create(), 'graph', { enumerable:true,value:graph });
  };
  expect(areContextsEqual(make(1),make(1))).toBe(areContextsEqual({value:1},{value:1}));
  expect(areContextsEqual(make(1),make(2))).toBe(areContextsEqual({value:1},{value:2}));
  expect(reads).toBeLessThan(100);
});
