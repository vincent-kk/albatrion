import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it('preserves unread perished snapshots through array rekey and clear fallback', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      list: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            on: { type: 'boolean' },
            held: { type: 'string', controls: { active: '../on' } },
          },
        },
      },
    },
  });
  root.setValue({
    list: [
      { on: true, held: 'first' },
      { on: true, held: 'second' },
    ],
  });
  const first = root.find('/list/0')!;
  root.find('/list/0/on')!.setValue(false);
  root.find('/list/1/on')!.setValue(false);
  const list = root.find('/list')!;
  if (list.type !== 'array') throw new Error('Expected array host');
  list.remove(0);
  expect(first.inactiveValues).toEqual([
    { path: '/list/0/held', value: 'first' },
  ]);
  expect(root.inactiveValues).toEqual([
    { path: '/list/0/held', value: 'second' },
  ]);
  const held = first.inactiveValues;
  list.clear();
  expect(root.inactiveValues).toEqual([]);
  expect(first.inactiveValues).toBe(held);
});

it('keeps a captured unread generation independent from a later reset and replacement', () => {
  const { root } = makeFieldNodeTree(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            held: { type: 'string', controls: { active: false } },
          },
        },
      },
    },
    { snapshot: { open: true, group: { held: 'loaded' } } },
  );
  root.resetSubtree();
  const group = root.find('/group')!;
  root.find('/open')!.setValue(false);
  root.setValue({ open: false, group: { held: 'replaced' } });
  root.resetSubtree();
  expect(group.inactiveValues).toEqual([
    { path: '/group/held', value: 'loaded' },
  ]);
  expect(root.find('/group')!.inactiveValues).toEqual(group.inactiveValues);
  expect(Object.isFrozen(group.inactiveValues)).toBe(true);
});

it.each([false, true])(
  'preserves replacement and unset rules through unread same-name exits (replace=%s)',
  (replace) => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          controls: { active: './kind === "s"' },
          properties: { value: { type: 'string' } },
        },
        {
          controls: { active: './kind === "n"' },
          properties: {
            value: { type: 'number', controls: { unsetOnInactive: true } },
          },
        },
      ],
    });
    root.setValue({ kind: 's', value: 'kept' });
    root.find('/kind')!.setValue('n');
    if (replace) root.find('/value')!.setValue(7);
    root.find('/kind')!.setValue('none');
    root.find('/kind')!.setValue('s');
    root.find('/kind')!.setValue('none');
    expect(root.inactiveValues).toEqual(
      replace ? [] : [{ path: '/value', value: 'kept' }],
    );
    expect(Object.isFrozen(root.inactiveValues)).toBe(true);
  },
);
