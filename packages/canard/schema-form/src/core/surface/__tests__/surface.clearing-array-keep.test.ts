import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '../../__tests__/makeFieldNodeTree';

it.each([false, true])(
  'publishes compacted kept sources and restores inactive=%s sources when their gate opens',
  (inactive) => {
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
    root.setValue({
      open: true,
      show: true,
      list: [{ drop: 1 }, { drop: 2, keep: 12 }, { drop: 3 }, { keep: 24 }],
    });
    const oldList = root.find('/list')!;
    const oldKeep = root.find('/list/1/keep')!;
    const oldItem = root.find('/list/1')!;
    if (inactive) root.find('/show')!.setValue(false);
    const precedingInactive = root.inactiveValues;
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([
      { path: '/list/0/keep', value: 12 },
      { path: '/list/1/keep', value: 24 },
    ]);
    expect(root.inactiveValues).toBe(root.inactiveValues);
    if (inactive) {
      expect(oldItem.inactiveValues).toEqual([
        { path: '/list/1/keep', value: 12 },
      ]);
      expect(oldItem.inactiveValues[0]).toBe(
        precedingInactive.find((entry) => entry.path === '/list/1/keep'),
      );
    }
    root.find('/open')!.setValue(true);
    expect(root.find('/list')!.children).toHaveLength(2);
    expect(root.find('/list')).not.toBe(oldList);
    expect(oldList.active).toBe(false);
    expect(oldKeep.active).toBe(false);
    expect(oldKeep.value).toBe(12);
    expect(root.inactiveValues).toEqual(
      inactive
        ? [
            { path: '/list/0/keep', value: 12 },
            { path: '/list/1/keep', value: 24 },
          ]
        : [],
    );
    if (inactive) {
      root.find('/open')!.setValue(false);
      root.find('/open')!.setValue(true);
      expect(root.find('/list')!.children).toHaveLength(2);
      expect(root.inactiveValues).toEqual([
        { path: '/list/0/keep', value: 12 },
        { path: '/list/1/keep', value: 24 },
      ]);
    }
    root.find('/show')!.setValue(true);
    expect(root.value).toEqual({
      open: true,
      show: true,
      list: [{ keep: 12 }, { keep: 24 }],
    });
    expect(root.inactiveValues).toEqual([]);
    root.find('/open')!.setValue(false);
    root.find('/open')!.setValue(true);
    expect(root.find('/list')!.value).toEqual([{ keep: 12 }, { keep: 24 }]);
  },
);

it('keeps an inactive survivor through repeated parent exits when its new position never visited that field', () => {
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
            ready: { type: 'boolean' },
            keep: {
              type: 'number',
              controls: {
                active: '../ready && #/show',
                unsetOnInactive: false,
              },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    show: true,
    list: [{ ready: false }, { ready: true, keep: 12 }],
  });
  root.find('/show')!.setValue(false);
  for (let cycle = 0; cycle < 2; cycle++) {
    root.find('/open')!.setValue(false);
    root.find('/open')!.setValue(true);
    expect(root.find('/list')!.children).toHaveLength(1);
    expect(root.inactiveValues).toEqual([{ path: '/list/0/keep', value: 12 }]);
  }
  root.find('/show')!.setValue(true);
  root.find('/list/0/ready')!.setValue(true);
  expect(root.find('/list/0/keep')!.value).toBe(12);
});

it('compacts already inactive nested arrays without losing their row-local keep policies', () => {
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
            inner: {
              type: 'array',
              controls: { active: '#/show' },
              items: {
                type: 'object',
                properties: {
                  ready: { type: 'boolean' },
                  keep: {
                    type: 'number',
                    controls: { active: '../ready', unsetOnInactive: false },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    show: true,
    list: [{ inner: [{ ready: false }, { ready: true, keep: 12 }] }],
  });
  root.find('/show')!.setValue(false);
  for (let cycle = 0; cycle < 2; cycle++) {
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([
      { path: '/list/0/inner/0/keep', value: 12 },
    ]);
    root.find('/open')!.setValue(true);
    expect(root.inactiveValues).toEqual([
      { path: '/list/0/inner/0/keep', value: 12 },
    ]);
  }
  root.find('/show')!.setValue(true);
  expect(root.find('/list/0/inner')!.children).toHaveLength(1);
  root.find('/list/0/inner/0/ready')!.setValue(true);
  expect(root.find('/list/0/inner/0/keep')!.value).toBe(12);
});
