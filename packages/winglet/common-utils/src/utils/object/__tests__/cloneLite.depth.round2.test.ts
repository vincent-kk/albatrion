import { describe, expect, it } from 'vitest';

import { cloneLite } from '../cloneLite';

const nest = (value: unknown, depth: number): unknown => {
  while (depth--) value = { child: value };
  return value;
};
const unwrap = (value: unknown, depth: number): unknown => {
  while (
    depth-- &&
    value !== null &&
    typeof value === 'object' &&
    'child' in value
  )
    value = value.child;
  return value;
};

describe('round-2 json 7: cloneLite deep-path equivalence', () => {
  it('copies a deep payload like a shallow payload', () => {
    const payload = { item: [1, { value: 2 }] };
    expect(unwrap(cloneLite(nest(payload, 10000)), 10000)).toEqual(
      cloneLite(payload),
    );
  });
  it('preserves sparse holes across the deep path', () => {
    const payload = new Array<unknown>(4);
    payload[2] = { value: 1 };
    const shallow = cloneLite(payload);
    const deep = unwrap(cloneLite(nest(payload, 10000)), 10000);
    expect(Object.keys(deep ?? {})).toEqual(Object.keys(shallow));
    expect(Object.getOwnPropertyDescriptor(deep, 'length')?.value).toBe(
      shallow.length,
    );
    expect(Object.getOwnPropertyDescriptor(deep, '2')?.value).toEqual(
      shallow[2],
    );
    expect(Object.getOwnPropertyDescriptor(deep, '2')?.value).not.toBe(
      payload[2],
    );
  });
  it('retains null prototypes and own reserved keys on the deep path', () => {
    const payload = Object.create(null);
    Object.defineProperty(payload, '__proto__', {
      value: { x: 1 },
      enumerable: true,
    });
    const shallow = cloneLite(payload);
    const deep = unwrap(cloneLite(nest(payload, 10000)), 10000);
    expect(Object.getPrototypeOf(deep)).toBe(Object.getPrototypeOf(shallow));
    expect(Object.keys(deep ?? {})).toEqual(Object.keys(shallow));
    expect(Object.getOwnPropertyDescriptor(deep, '__proto__')?.value).toEqual(
      shallow.__proto__,
    );
    expect(Object.getOwnPropertyDescriptor(deep, '__proto__')?.value).not.toBe(
      payload.__proto__,
    );
  });
  it('retains unsupported leaf identity across the deep path', () => {
    const date = new Date(0);
    expect(unwrap(cloneLite(nest(date, 10000)), 10000)).toBe(cloneLite(date));
  });
  it('uses the same maxDepth boundary after a deep prefix', () => {
    const payload = { child: { value: 1 } };
    const shallow = cloneLite(payload, 1);
    const deep = unwrap(cloneLite(nest(payload, 10000), 10001), 10000);
    expect(Object.getOwnPropertyDescriptor(deep, 'child')?.value).toBe(
      shallow.child,
    );
    expect(unwrap(cloneLite(nest(payload, 10000), 10000), 10000)).toBe(
      cloneLite(payload, 0),
    );
  });
});


it('round-2 common-utils: the maxDepth 3 example shares connection', () => {
  const source = { config: { database: { connection: { pool: { settings: { max: 100 } } } } } };
  const result = cloneLite(source, 3);
  expect(result).not.toBe(source);
  expect(result.config).not.toBe(source.config);
  expect(result.config.database).not.toBe(source.config.database);
  expect(result.config.database.connection).toBe(source.config.database.connection);
  expect(result.config.database.connection.pool).toBe(source.config.database.connection.pool);
});
