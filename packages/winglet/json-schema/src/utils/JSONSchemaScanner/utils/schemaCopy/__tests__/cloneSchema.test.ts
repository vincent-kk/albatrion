import { expect, it } from 'vitest';

import { cloneSchema } from '../cloneSchema';

it('copies repeated objects separately instead of preserving aliases', () => {
  const shared = { nested: { value: 1 } };
  const copy = cloneSchema({ first: shared, second: shared });
  expect(copy).toEqual({ first: shared, second: shared });
  expect(copy.first).not.toBe(shared);
  expect(copy.first).not.toBe(copy.second);
  expect(copy.first.nested).not.toBe(copy.second.nested);
});

it('preserves sparse array holes and drops symbol keys', () => {
  const key = Symbol('metadata');
  const source = { array: new Array(5), [key]: { value: 1 } };
  source.array[3] = { value: 2 };
  const copy = cloneSchema(source);
  expect(copy.array).toHaveLength(5);
  expect(0 in copy.array).toBe(false);
  expect(3 in copy.array).toBe(true);
  expect(copy.array[3]).not.toBe(source.array[3]);
  expect(Object.getOwnPropertySymbols(copy)).toEqual([]);
});

it('copies own __proto__ as data without changing the output prototype', () => {
  const source = JSON.parse('{"__proto__":{"polluted":true},"type":"object"}');
  const copy = cloneSchema(source);
  expect(Object.getPrototypeOf(copy)).toBe(Object.prototype);
  expect(Object.prototype.hasOwnProperty.call(copy, '__proto__')).toBe(true);
  expect(copy.__proto__).toEqual({ polluted: true });
  expect(copy.__proto__).not.toBe(source.__proto__);
  expect(({} as Record<string, unknown>).polluted).toBeUndefined();
});

it('copies 20000 levels without recursion', () => {
  let source: Record<string, unknown> = { leaf: true };
  for (let index = 0; index < 20000; index++) source = { child: source };
  let copy = cloneSchema(source);
  for (let index = 0; index < 20000; index++)
    copy = copy.child as Record<string, unknown>;
  expect(copy).toEqual({ leaf: true });
});

it('rejects a physical cycle in data values with the scanner error code', () => {
  const data: Record<string, unknown> = {};
  data.self = data;
  expect(() => cloneSchema({ default: data })).toThrowError(
    expect.objectContaining({ code: 'schema-cycle' }),
  );
});

it('delegates non-plain values to the existing clone implementation', () => {
  const date = new Date('2026-01-01T00:00:00Z');
  const map = new Map([['key', { value: 1 }]]);
  const copy = cloneSchema({ date, map });
  expect(copy.date).toEqual(date);
  expect(copy.date).not.toBe(date);
  expect(copy.map).toEqual(map);
  expect(copy.map.get('key')).not.toBe(map.get('key'));
});

it('rejects a long physical cycle in data values', () => {
  const nodes: Record<string, unknown>[] = Array.from(
    { length: 350 },
    () => ({}),
  );
  for (let index = 0; index < nodes.length; index++)
    nodes[index].next = nodes[(index + 1) % nodes.length];
  expect(() => cloneSchema({ default: nodes[0] })).toThrowError(
    expect.objectContaining({ code: 'schema-cycle' }),
  );
});

it('copies an alias DAG deeper than 600 without treating its second occurrence as a cycle', () => {
  let shared: Record<string, unknown> = { value: 1 };
  for (let index = 0; index < 700; index++) shared = { child: shared };
  const copy = cloneSchema({ first: shared, second: shared });
  expect(copy.first === shared).toBe(false);
  expect(copy.first === copy.second).toBe(false);
  let first = copy.first;
  let second = copy.second;
  for (let index = 0; index < 700; index++) {
    first = first.child as Record<string, unknown>;
    second = second.child as Record<string, unknown>;
  }
  expect(first.value).toBe(1);
  expect(second.value).toBe(1);
});
