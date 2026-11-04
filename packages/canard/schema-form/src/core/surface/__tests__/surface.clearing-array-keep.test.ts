import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import { isArrayNode } from '../utils/guards';

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
    expect(oldList.isActive).toBe(false);
    expect(oldKeep.isActive).toBe(false);
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

it('ignores survivor old-reference writes after compaction', () => {
  const root = buildClearingList();
  const oldKeep = root.find('/list/1/keep')!;
  const lastKeep = root.find('/list/3/keep')!;
  root.find('/open')!.setValue(false);
  oldKeep.setValue(13);
  lastKeep.setValue(25);
  root.find('/open')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{ keep: 12 }, { keep: 24 }]);
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

it('drops a write through a descendant of an already inactive object inside a discarded item', () => {
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
            group: {
              type: 'object',
              controls: { active: '#/show', unsetOnInactive: false },
              properties: { keep: { type: 'number' } },
            },
          },
        },
      },
    },
  });
  root.setValue({
    open: true,
    show: true,
    list: [
      { drop: 1 },
      { drop: 2, group: { keep: 12 } },
      { drop: 3 },
      { group: { keep: 24 } },
    ],
  });
  const emptyKeep = root.find('/list/0/group/keep')!;
  root.find('/show')!.setValue(false);
  root.find('/open')!.setValue(false);
  emptyKeep.setValue(5);
  root.find('/open')!.setValue(true);
  root.find('/show')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([
    { group: { keep: 12 } },
    { group: { keep: 24 } },
  ]);
});

it('ignores original row-reference writes when an inactive list compacts', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      show: { type: 'boolean' },
      section: {
        type: 'object',
        controls: { active: '#/show', unsetOnInactive: true },
        properties: {
          list: {
            type: 'array',
            controls: { active: '#/open' },
            items: {
              type: 'object',
              properties: {
                drop: { type: 'number' },
                keep: {
                  type: 'number',
                  controls: { unsetOnInactive: false },
                },
                tags: {
                  type: 'array',
                  controls: { unsetOnInactive: true },
                  items: {
                    type: 'object',
                    properties: {
                      keep: {
                        type: 'number',
                        controls: { unsetOnInactive: false },
                      },
                    },
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
    section: { list: [{ drop: 1 }, { keep: 12, tags: [{ keep: 3 }] }] },
  });
  const discardedDrop = root.find('/section/list/0/drop')!;
  const survivorKeep = root.find('/section/list/1/keep')!;
  root.find('/open')!.setValue(false);
  root.find('/show')!.setValue(false);
  discardedDrop.setValue(5);
  survivorKeep.setValue(13);
  root.find('/show')!.setValue(true);
  root.find('/open')!.setValue(true);
  expect(root.find('/section/list')!.value).toEqual([
    { keep: 12, tags: [{ keep: 3 }] },
  ]);
});

it('drops a write through an inactive candidate carried into a re-entered row once that row is discarded', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      show: { type: 'boolean' },
      flag: { type: 'boolean' },
      section: {
        type: 'object',
        controls: { active: '#/open', unsetOnInactive: true },
        properties: {
          list: {
            type: 'array',
            controls: { active: '#/show' },
            items: {
              type: 'object',
              properties: {
                p: { type: 'number', controls: { active: '#/flag' } },
                keep: {
                  type: 'number',
                  controls: { unsetOnInactive: false },
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
    flag: true,
    section: { list: [{ p: 1 }, { keep: 2 }] },
  });
  const carried = root.find('/section/list/0/p')!;
  root.find('/flag')!.setValue(false);
  root.find('/show')!.setValue(false);
  root.find('/show')!.setValue(true);
  root.find('/open')!.setValue(false);
  carried.setValue(5);
  root.find('/open')!.setValue(true);
  root.find('/flag')!.setValue(true);
  expect(root.find('/section/list')!.value).toEqual([{ keep: 2 }]);
});

it('drops a write through an inactive candidate transferred between tuple rows once its destination row is discarded', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      flag: { type: 'boolean' },
      list: {
        type: 'array',
        controls: { active: '#/open', unsetOnInactive: true },
        prefixItems: [
          {
            type: 'object',
            properties: {
              kind: { type: 'string' },
              p: { type: 'number', controls: { active: '#/flag' } },
              keep: { type: 'number', controls: { unsetOnInactive: false } },
            },
            allOf: [
              {
                controls: { active: './kind === "text"' },
                properties: { value: { type: 'string' } },
              },
              {
                controls: { active: './kind === "number"' },
                properties: { value: { type: 'number' } },
              },
            ],
          },
          {
            type: 'object',
            properties: {
              kind: { type: 'string' },
              p: { type: 'number', controls: { active: '#/flag' } },
              keep: { type: 'number', controls: { unsetOnInactive: false } },
            },
            allOf: [
              {
                controls: { active: './kind === "text"' },
                properties: { value: { type: 'string' } },
              },
              {
                controls: { active: './kind === "number"' },
                properties: { value: { type: 'number' } },
              },
            ],
          },
          {
            type: 'object',
            properties: {
              kind: { type: 'string' },
              p: { type: 'number', controls: { active: '#/flag' } },
              keep: { type: 'number', controls: { unsetOnInactive: false } },
            },
            allOf: [
              {
                controls: { active: './kind === "text"' },
                properties: { value: { type: 'string' } },
              },
              {
                controls: { active: './kind === "number"' },
                properties: { value: { type: 'number' } },
              },
            ],
          },
        ],
      },
    },
  });
  root.setValue({ open: true, flag: true, list: [{}, { p: 1 }, { keep: 2 }] });
  const originalRow = root.find('/list/1')!;
  const carried = root.find('/list/1/p')!;
  root.find('/flag')!.setValue(false);
  const list = root.find('/list')!;
  expect(isArrayNode(list)).toBe(true);
  if (!isArrayNode(list)) throw new Error('Expected the tuple array');
  list.remove(0);
  expect(root.find('/list/0')).not.toBe(originalRow);
  root.find('/open')!.setValue(false);
  carried.setValue(5);
  root.find('/open')!.setValue(true);
  root.find('/flag')!.setValue(true);
  expect(root.find('/list')!.value).toEqual([{ keep: 2 }]);
});
