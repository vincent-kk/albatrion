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
