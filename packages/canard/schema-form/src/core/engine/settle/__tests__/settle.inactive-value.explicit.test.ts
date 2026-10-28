import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { WriteOption } from '../../types/value';
import { dispatchWriteInput } from '../../write';

it('treats a form input merge like a caller merge', () => {
  const resolver = vi.fn(() => 'resolved');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          x: { type: 'string', controls: { inactiveValue: resolver } },
        },
      },
    },
  });
  root.setValue({ open: true, group: { x: 'before' } });
  dispatchWriteInput(root, { open: false, group: {} }, WriteOption.Merge);
  expect(resolver).toHaveBeenCalledTimes(1);
  root.find('/open')!.setValue(true);
  expect(root.find('/group/x')!.value).toBe('resolved');
});

it('treats a received key below a batched merge as a whole input', () => {
  const resolver = vi.fn(() => 'resolved');
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      stable: { type: 'string' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: {
          x: { type: 'string', controls: { inactiveValue: resolver } },
        },
      },
    },
  });
  root.setValue({ open: true, stable: 'before', group: { x: 'before' } });
  root.batch(() => {
    root.setValue({ open: false, group: {} }, WriteOption.Merge);
    root.find('/stable')!.setValue('next');
  });
  expect(resolver).not.toHaveBeenCalled();
  root.find('/open')!.setValue(true);
  expect(root.find('/group/x')!.value).toBeUndefined();
});

it.each([false, true])(
  'honors an explicit ancestor whole or merge input: merge=%s',
  (merge) => {
    const resolver = vi.fn(() => 'resolved');
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            x: { type: 'string', controls: { inactiveValue: resolver } },
          },
        },
      },
    });
    root.setValue({ open: true, group: { x: 'before' } });
    root.setValue(
      { open: false, group: {} },
      merge ? WriteOption.Merge : WriteOption.Overwrite,
    );
    expect(resolver).toHaveBeenCalledTimes(merge ? 1 : 0);
    root.find('/open')!.setValue(true);
    expect(root.find('/group/x')!.value).toBe(merge ? 'resolved' : undefined);
  },
);

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
