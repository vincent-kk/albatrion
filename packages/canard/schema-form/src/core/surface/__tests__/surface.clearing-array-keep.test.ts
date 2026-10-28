import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

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

const buildClearingList = () => {
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
            keep: {
              type: 'number',
              controls: { unsetOnInactive: false },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    list: [{ drop: 1 }, { drop: 2, keep: 12 }, { drop: 3 }, { keep: 24 }],
  });
  return root;
};

it('writes a survivor old reference to the same survivor after compaction', () => {
  const root = buildClearingList();
  const oldKeep = root.find('/list/1/keep')!;
  const lastKeep = root.find('/list/3/keep')!;
  root.find('/open')!.setValue(false);
  oldKeep.setValue(13);
  lastKeep.setValue(25);
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{ keep: 13 }, { keep: 25 }]);
});

it('drops a write addressed at a discarded item after compaction', () => {
  const root = buildClearingList();
  const discarded = root.find('/list/0/drop')!;
  const discardedItem = root.find('/list/2')!;
  root.find('/open')!.setValue(false);
  discarded.setValue(99);
  discardedItem.setValue({ drop: 5, keep: 7 });
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{ keep: 12 }, { keep: 24 }]);
});

it('drops a write through an already inactive descendant of a discarded item', () => {
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
  const emptyKeep = root.find('/list/0/keep')!;
  root.find('/show')!.setValue(false);
  root.find('/open')!.setValue(false);
  emptyKeep.setValue(5);
  root.find('/open')!.setValue(true);
  root.find('/show')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{ keep: 12 }, { keep: 24 }]);
});
