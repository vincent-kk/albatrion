import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it.each([false, true])(
  'distinguishes omitted and explicit batch values: %s',
  (explicit) => {
    const resolver = vi.fn(() => 'resolved');
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        stable: { type: 'string' },
        value: {
          type: 'string',
          controls: { active: '../open', inactiveValue: resolver },
        },
      },
    });
    root.setValue({ open: true, stable: 'before', value: 'before' });
    root.batch(() => {
      root.find('/open')!.setValue(false);
      root.find('/stable')!.setValue('next');
      if (explicit) root.find('/value')!.setValue('explicit');
    });
    expect(resolver).toHaveBeenCalledTimes(explicit ? 0 : 1);
    expect(root.inactiveValues).toEqual([
      { path: '/value', value: explicit ? 'explicit' : 'resolved' },
    ]);
  },
);

it('does not treat an omitted key in a root replacement as an explicit value', () => {
  const resolver = vi.fn(() => 'resolved');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../open', inactiveValue: resolver },
      },
    },
  });
  root.setValue({ open: true, value: 'before' });
  root.setValue({ open: false });
  expect(resolver).toHaveBeenCalledTimes(1);
  expect(root.inactiveValues).toEqual([{ path: '/value', value: 'resolved' }]);
});
