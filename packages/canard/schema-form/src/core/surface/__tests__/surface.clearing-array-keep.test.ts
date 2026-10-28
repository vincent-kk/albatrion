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
    if (inactive) root.find('/show')!.setValue(false);
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([
      { path: '/list/0/keep', value: 12 },
      { path: '/list/1/keep', value: 24 },
    ]);
    expect(root.inactiveValues).toBe(root.inactiveValues);
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
