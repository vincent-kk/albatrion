import { expect, it, onTestFinished } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { engineModes } from '@/schema-form/core/engine';

for (const childInactive of [false, true])
  it.each(['off', 'on', 'verify'] as const)(
    `%s preserves a packed array with previously inactive star child=${childInactive}`,
    (mode) => {
      const previous = engineModes.slots;
      engineModes.setMode('slots', mode);
      onTestFinished(() => engineModes.setMode('slots', previous));
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
      expect(root.inactiveValues).toEqual([
        { path: '/group', value },
        { path: '/group/0/*/x', value: 'patched' },
      ]);
      expect(root.inactiveValues[0]).toBe(entry);
      root.find('/open')!.setValue(true);
      root.find('/xOpen')!.setValue(true);
      expect(root.find('/group')!.value).toEqual(value);
    },
  );
