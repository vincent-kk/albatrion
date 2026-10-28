import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('calls an instance listener once while still attached and restores its result', () => {
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  const old = root.find('/value')!;
  const listener = vi.fn((value, context) => {
    expect(old.active).toBe(true);
    expect(value).toBe('before');
    expect(context.rootValue).toEqual({ open: true, value: 'before' });
    expect(context.dataPath).toBe('/value');
    return 'after';
  });
  old.onInactive(listener);
  root.find('/open')!.setValue(false);
  expect(listener).toHaveBeenCalledTimes(1);
  root.find('/open')!.setValue(true);
  expect(root.find('/value')!.value).toBe('after');
  root.find('/open')!.setValue(false);
  expect(listener).toHaveBeenCalledTimes(1);
});

it('unsubscribes a listener and deduplicates the same registration', () => {
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  const value = root.find('/value')!;
  const listener = vi.fn(() => 'after');
  const unsubscribe = value.onInactive(listener);
  value.onInactive(listener);
  unsubscribe();
  unsubscribe();
  root.find('/open')!.setValue(false);
  expect(listener).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
});

it('uses a non-undefined listener result instead of invoking the declaration', () => {
  const declared = vi.fn(() => 'declared');
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open', inactiveValue: declared } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.find('/value')!.onInactive(() => 'listener');
  root.find('/open')!.setValue(false);
  expect(declared).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'listener' }]);
});

it('falls back to the declaration when all listeners return undefined', () => {
  const declared = vi.fn(() => 'declared');
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open', inactiveValue: declared } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.find('/value')!.onInactive(() => undefined);
  root.find('/open')!.setValue(false);
  expect(declared).toHaveBeenCalledTimes(1);
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'declared' }]);
});

it('does not call a listener for array removal or clear', () => {
  const { root } = makeFieldNodeTree({ type: 'array', items: { type: 'string' } });
  if (root.type !== 'array') throw new Error('Expected array');
  root.setValue(['first', 'second']);
  const listener = vi.fn();
  root.find('/0')!.onInactive(listener);
  root.find('/1')!.onInactive(listener);
  root.remove(0);
  root.clear();
  expect(listener).not.toHaveBeenCalled();
});

it('does not call a listener for a clear-policy gate exit', () => {
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open', unsetOnInactive: true } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  const listener = vi.fn(() => 'after');
  root.find('/value')!.onInactive(listener);
  root.find('/open')!.setValue(false);
  expect(listener).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([]);
});

it('calls every listener in registration order and keeps the last defined result', () => {
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  const order: number[] = [];
  const value = root.find('/value')!;
  value.onInactive(() => { order.push(1); return 'first'; });
  value.onInactive(() => { order.push(2); return 'last'; });
  value.onInactive(() => { order.push(3); return undefined; });
  root.find('/open')!.setValue(false);
  expect(order).toEqual([1, 2, 3]);
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'last' }]);
});

it('cancels the entire override after a listener throws and still calls the others', () => {
  const declared = vi.fn(() => 'declared');
  const { root } = makeFieldNodeTree({
    type: 'object', properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open', inactiveValue: declared } },
    },
  });
  root.setValue({ open: true, value: 'before' });
  const afterThrow = vi.fn(() => 'last');
  const value = root.find('/value')!;
  value.onInactive(() => 'first');
  value.onInactive(() => { throw new Error('failed listener'); });
  value.onInactive(afterThrow);
  expect(() => root.find('/open')!.setValue(false)).toThrow();
  expect(afterThrow).toHaveBeenCalledTimes(1);
  expect(declared).not.toHaveBeenCalled();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
});
