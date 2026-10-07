import { afterEach, expect, it, vi } from 'vitest';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { SchemaNodeRecord } from '../../../../../record';
import { objectKeyCounts } from '../../../utils/objectKeyCounts';
import { assembleObject } from '../assembleObject';

afterEach(() => vi.restoreAllMocks());

/** Produce a stable shape through the real assembler before measuring runtime work. */
const fixture = (numeric = true) => {
  const nested = { nested: 1 };
  const children = [
    { name: 'constructor', emit: 'ctor' }, { name: '__proto__', emit: nested },
    ...(numeric ? [{ name: '10', emit: 10 }, { name: '2', emit: 2 }, { name: '01', emit: 1 }] : []),
    { name: 'group', emit: nested },
  ];
  const node = { local: undefined, extras: undefined, schema: { schema: { type: 'object' } },
    blueprintNode: { childEntries: children.map(child => ({ name: child.name })) },
  } as unknown as SchemaNodeRecord<unknown>;
  const first = assembleObject(node, children) as Record<string, unknown>;
  node.local = first;
  return { node, children, first, nested };
};

it('preserves numeric/string order, special data keys and unchanged child identities', () => {
  const { node, children, first, nested } = fixture();
  children[0].emit = 'changed';
  const result = assembleObject(node, children, [children[0]], { incremental: false }) as Record<string, unknown>;
  expect(Object.keys(result)).toEqual(Object.keys(first));
  expect(Object.keys(result)).toEqual(['2', '10', 'constructor', '__proto__', '01', 'group']);
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toEqual({
    value: nested, enumerable: true, configurable: true, writable: true,
  });
  expect(result.constructor).toBe('changed');
  expect(result.group).toBe(children[5].emit);
  expect(result.__proto__).toBe(children[1].emit);
  expect(first.constructor).toBe('ctor');
  node.local = result;
  expect(assembleObject(node, children, [children[0]], { incremental: false })).toBe(result);
});

it('also preserves the proven full-child patch and equal-value reference', () => {
  const { node, children, first } = fixture(false);
  children[0].emit = 'changed';
  const result = assembleObject(node, children) as Record<string, unknown>;
  expect(result).not.toBe(first);
  expect(Object.keys(result)).toEqual(Object.keys(first));
  expect(result.__proto__).toBe(children[1].emit);
  expect(result.group).toBe(children[2].emit);
  node.local = result;
  expect(assembleObject(node, children)).toBe(result);
});

it('keeps the existing fallback when children identity changes', () => {
  const { node, children, first } = fixture();
  let enumerations = 0;
  const previous = new Proxy(first, { ownKeys(target) { enumerations++; return Reflect.ownKeys(target); } });
  node.local = previous;
  objectKeyCounts.set(previous, Object.keys(first).length);
  children[0].emit = 'changed';
  const hint = { incremental: false };
  const result = assembleObject(node, children.slice(), [children[0]], hint) as Record<string, unknown>;
  expect(hint.incremental).toBe(false);
  expect(enumerations).toBeGreaterThan(0);
  expect(result.constructor).toBe('changed');
  expect(Object.keys(result)).toEqual(Object.keys(first));
});

it('rebuilds authored key order when schema identity changes', () => {
  const { node, children } = fixture();
  node.schema = { schema: { type: 'object', options: { propertyKeys: ['group', '01', '__proto__', 'constructor'] } }, typeConflict: false } as typeof node.schema;
  children[0].emit = 'changed';
  const hint = { incremental: false };
  const result = assembleObject(node, children, [children[0]], hint) as Record<string, unknown>;
  expect(hint.incremental).toBe(false);
  expect(Object.keys(result)).toEqual(['2', '10', 'group', '01', '__proto__', 'constructor']);
  expect(result.group).toBe(children[5].emit);
});

it('rebuilds extras and key insertion/deletion through the existing path', () => {
  const { node, children } = fixture();
  node.extras = { extra: { retained: true } };
  children[0].emit = 'changed';
  const hint = { incremental: false };
  let result = assembleObject(node, children, [children[0]], hint) as Record<string, unknown>;
  expect(hint.incremental).toBe(false);
  expect(result.extra).toBe((node.extras as Record<string, unknown>).extra);
  node.local = result;
  children[4].emit = undefined!;
  hint.incremental = false;
  result = assembleObject(node, children, [children[4]], hint) as Record<string, unknown>;
  expect(hint.incremental).toBe(false);
  expect(hasOwnProperty(result, '01')).toBe(false);
  node.local = result;
  children[4].emit = 11;
  hint.incremental = false;
  result = assembleObject(node, children, [children[4]], hint) as Record<string, unknown>;
  expect(hint.incremental).toBe(false);
  expect(Object.keys(result)).toEqual(['2', '10', 'constructor', '__proto__', '01', 'group', 'extra']);
});
