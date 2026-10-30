import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { isArrayNode } from '../utils/guards';

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])(
  'drops discarded item writes with keep declaration=%s and item target=%s',
  (declaredKeep, itemTarget) => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '#/open', unsetOnInactive: true },
          items: {
            type: 'object',
            properties: {
              drop: { type: 'number' },
              ...(declaredKeep
                ? {
                    keep: {
                      type: 'number' as const,
                      controls: { unsetOnInactive: false },
                    },
                  }
                : {}),
            },
          },
        },
      },
    });
    root.setValue({ open: true, list: [{ drop: 1 }] });
    const old = root.find(itemTarget ? '/list/0' : '/list/0/drop')!;
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([]);
    old.setValue(itemTarget ? { drop: 99 } : 99);
    expect(root.inactiveValues).toEqual([]);
    root.find('/open')!.setValue(true);
    expect(root.find('/list')!.value).toEqual([]);
    const list = root.find('/list')!;
    if (!isArrayNode(list)) throw new Error('Expected an array host');
    list.push({ drop: 2 });
    old.setValue(itemTarget ? { drop: 100 } : 100);
    expect(list.value).toEqual([{ drop: 2 }]);
  },
);

it('drops writes below a zero-survivor inner array of a kept outer item', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            keep: { type: 'number', controls: { unsetOnInactive: false } },
            inner: {
              type: 'array',
              items: { type: 'object', properties: { x: { type: 'number' } } },
            },
          },
        },
      },
    },
  });
  root.setValue({ open: true, list: [{ keep: 1, inner: [{ x: 2 }] }] });
  const old = root.find('/list/0/inner/0/x')!;
  expect(old.value).toBe(2);
  root.find('/open')!.setValue(false);
  const before = root.inactiveValues;
  old.setValue(9);
  expect(root.inactiveValues).toEqual(before);
  root.find('/open')!.setValue(true);
  expect(root.find('/list/0/keep')!.value).toBe(1);
  expect(root.find('/list/0/inner/0/x')).toBeNull();
  expect(JSON.stringify(root.find('/list')!.value)).not.toContain('9');
});

it('drops writes through an already inactive keep candidate of a zero-survivor array', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      show: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        items: {
          type: 'object',
          properties: {
            drop: { type: 'number' },
            keep: {
              type: 'number',
              controls: { active: '#/show', unsetOnInactive: false },
            },
          },
        },
      },
    },
  });
  root.setValue({ open: true, show: true, list: [{ drop: 1 }] });
  const old = root.find('/list/0/keep')!;
  expect(old.value).toBeUndefined();
  root.find('/show')!.setValue(false);
  root.find('/open')!.setValue(false);
  const before = root.inactiveValues;
  old.setValue(5);
  expect(root.inactiveValues).toEqual(before);
  root.find('/open')!.setValue(true);
  root.find('/show')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([]);
});
