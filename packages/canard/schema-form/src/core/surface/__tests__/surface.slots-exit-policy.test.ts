import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('clears a host source while preserving an explicitly retained descendant', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      outer: {
        type: 'object',
        controls: { active: '../show', unsetOnInactive: true },
        properties: {
          drop: { type: 'string' },
          keep: { type: 'string', controls: { unsetOnInactive: false } },
        },
      },
    },
  });
  root.setValue({
    show: true,
    outer: { drop: 'clear', keep: 'retained', extra: 'clear' },
  });
  const outer = root.find('/outer')!;
  const value = outer.value;
  root.find('/show')!.setValue(false);
  expect(root.inactiveValues).toEqual([
    { path: '/outer/keep', value: 'retained' },
  ]);
  root.find('/show')!.setValue(true);
  expect(root.find('/outer/drop')!.raw).toBeUndefined();
  expect(root.find('/outer/keep')!.raw).toBe('retained');
  expect(root.find('/outer')!.undeclaredValues).toBeUndefined();
  expect(outer.value).toBe(value);
  expect(outer.undeclaredValues).toEqual({ extra: 'clear' });
});

it('preserves source slots when a throwing gate causes the exit', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      tick: { type: 'number' },
      value: {
        type: 'string',
        controls: {
          active:
            '#/tick !== 1 ? true : (() => { throw new Error("gate failure") })()',
          unsetOnInactive: true,
        },
      },
    },
  });
  root.setValue({ tick: 0, value: 'preserved' });
  const old = root.find('/value')!;
  expect(() => root.find('/tick')!.setValue(1)).toThrow();
  expect(root.find('/value')).toBeNull();
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'preserved' }]);
  root.find('/tick')!.setValue(2);
  expect(root.find('/value')!.value).toBe('preserved');
  expect(root.find('/value')).not.toBe(old);
});
