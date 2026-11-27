import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

for (const childInactive of [false, true])
  it(`preserves a packed array with previously inactive star child=${childInactive}`, () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        xOpen: { type: 'boolean' },
        tick: { type: 'number' },
        group: {
          type: 'array',
          controls: { active: '../open' },
          items: {
            type: 'object',
            properties: {
              '*': {
                type: 'object',
                properties: {
                  x: {
                    type: 'string',
                    controls: { active: '../../../../xOpen' },
                  },
                },
              },
              plain: { type: 'string' },
            },
          },
        },
      },
    });
    const value = [{ '*': { x: 'held' }, plain: 'plain' }];
    root.setValue({ open: true, xOpen: true, tick: 0, group: value });
    const item = root.find('/group/0')!;
    const star = item.children!.find((node) => node.name === '*')!;
    if (childInactive) root.find('/xOpen')!.setValue(false);
    root.find('/open')!.setValue(false);
    expect(root.inactiveValues).toEqual([{ path: '/group', value }]);
    const entry = root.inactiveValues[0];
    expect(Object.isFrozen(entry.value)).toBe(true);
    star.setValue({ x: 'patched' });
    root.find('/tick')!.setValue(1);
    expect(root.inactiveValues).toEqual([{ path: '/group', value }]);
    expect(root.inactiveValues[0]).toBe(entry);
    root.find('/open')!.setValue(true);
    root.find('/xOpen')!.setValue(true);
    expect(root.find('/group')!.value).toEqual([
      { '*': { x: 'held' }, plain: 'plain' },
    ]);
  });
