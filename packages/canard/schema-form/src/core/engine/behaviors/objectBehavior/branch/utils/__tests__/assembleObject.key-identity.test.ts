import { afterEach, expect, it, vi } from 'vitest';

import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '@/schema-form/core/engine/record';

import { objectKeyCounts } from '../../../../../utils/cache/valueMemos';
import { assembleObject } from '../assembleObject';

afterEach(() => vi.restoreAllMocks());

/** Produce a stable shape through the real assembler before measuring runtime work. */
const fixture = (numeric = true) => {
  const nested = { nested: 1 };
  const children = [
    { name: 'constructor', storedOutputValue: 'ctor' },
    { name: '__proto__', storedOutputValue: nested },
    ...(numeric
      ? [
          { name: '10', storedOutputValue: 10 },
          { name: '2', storedOutputValue: 2 },
          { name: '01', storedOutputValue: 1 },
        ]
      : []),
    { name: 'group', storedOutputValue: nested },
  ];
  const node = {
    runtime: {},
    storedValue: undefined,
    extras: undefined,
    schema: { schema: { type: 'object' } },
    blueprintNode: {
      childEntries: children.map((child) => ({ name: child.name })),
    },
  } as unknown as FieldNodeRecord<unknown>;
  const first = assembleObject(node, children) as Record<string, unknown>;
  node.storedValue = first;
  return { node, children, first, nested };
};

it('preserves numeric/string order, special data keys and unchanged child identities', () => {
  const { node, children, first, nested } = fixture();
  children[0].storedOutputValue = 'changed';
  const result = assembleObject(node, children, [children[0]], {
    isIncremental: false,
  }) as Record<string, unknown>;
  expect(Object.keys(result)).toEqual(Object.keys(first));
  expect(Object.keys(result)).toEqual([
    '2',
    '10',
    'constructor',
    '__proto__',
    '01',
    'group',
  ]);
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toEqual({
    value: nested,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  expect(result.constructor).toBe('changed');
  expect(result.group).toBe(children[5].storedOutputValue);
  expect(result.__proto__).toBe(children[1].storedOutputValue);
  expect(first.constructor).toBe('ctor');
  node.storedValue = result;
  expect(
    assembleObject(node, children, [children[0]], { isIncremental: false }),
  ).toBe(result);
});

it('also preserves the proven full-child patch and equal-value reference', () => {
  const { node, children, first } = fixture(false);
  children[0].storedOutputValue = 'changed';
  const result = assembleObject(node, children) as Record<string, unknown>;
  expect(result).not.toBe(first);
  expect(Object.keys(result)).toEqual(Object.keys(first));
  expect(result.__proto__).toBe(children[1].storedOutputValue);
  expect(result.group).toBe(children[2].storedOutputValue);
  node.storedValue = result;
  expect(assembleObject(node, children)).toBe(result);
});

it('keeps the existing fallback when children identity changes', () => {
  const { node, children, first } = fixture();
  let enumerations = 0;
  const previous = new Proxy(first, {
    ownKeys(target) {
      enumerations++;
      return Reflect.ownKeys(target);
    },
  });
  node.storedValue = previous;
  objectKeyCounts.set(previous, Object.keys(first).length);
  children[0].storedOutputValue = 'changed';
  const hint = { isIncremental: false };
  const result = assembleObject(
    node,
    children.slice(),
    [children[0]],
    hint,
  ) as Record<string, unknown>;
  expect(hint.isIncremental).toBe(false);
  expect(enumerations).toBeGreaterThan(0);
  expect(result.constructor).toBe('changed');
  expect(Object.keys(result)).toEqual(Object.keys(first));
});

it('rebuilds authored key order when schema identity changes', () => {
  const { node, children } = fixture();
  node.schema = {
    schema: {
      type: 'object',
      options: { propertyOrder: ['group', '01', '__proto__', 'constructor'] },
    },
    hasTypeConflict: false,
  } as typeof node.schema;
  children[0].storedOutputValue = 'changed';
  const hint = { isIncremental: false };
  const result = assembleObject(node, children, [children[0]], hint) as Record<
    string,
    unknown
  >;
  expect(hint.isIncremental).toBe(false);
  expect(Object.keys(result)).toEqual([
    '2',
    '10',
    'group',
    '01',
    '__proto__',
    'constructor',
  ]);
  expect(result.group).toBe(children[5].storedOutputValue);
});

it('rebuilds extras and key insertion/deletion through the existing path', () => {
  const { node, children } = fixture();
  node.extras = { extra: { retained: true } };
  children[0].storedOutputValue = 'changed';
  const hint = { isIncremental: false };
  let result = assembleObject(node, children, [children[0]], hint) as Record<
    string,
    unknown
  >;
  expect(hint.isIncremental).toBe(false);
  expect(result.extra).toBe((node.extras as Record<string, unknown>).extra);
  node.storedValue = result;
  children[4].storedOutputValue = undefined!;
  hint.isIncremental = false;
  result = assembleObject(node, children, [children[4]], hint) as Record<
    string,
    unknown
  >;
  expect(hint.isIncremental).toBe(false);
  expect(hasOwnProperty(result, '01')).toBe(false);
  node.storedValue = result;
  children[4].storedOutputValue = 11;
  hint.isIncremental = false;
  result = assembleObject(node, children, [children[4]], hint) as Record<
    string,
    unknown
  >;
  expect(hint.isIncremental).toBe(false);
  expect(Object.keys(result)).toEqual([
    '2',
    '10',
    'constructor',
    '__proto__',
    '01',
    'group',
    'extra',
  ]);
});
