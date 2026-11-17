import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import type { InactiveValueContext } from '../../../types/controls';
import * as slotApplication from '../utils/arraySlots/applyArraySlots';
import * as spliceApplication from '../utils/arraySlots/applyArraySplice';

it('uses general slots for a moved exit and resolves its committed address', () => {
  const resolver = vi.fn((value: unknown, context: InactiveValueContext) => {
    expect(value).toBe('n1');
    expect(context.dataPath).toBe('/rows/1/note');
    return 'n1-exit';
  });
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            on: { type: 'boolean' },
            note: {
              type: 'string',
              controls: {
                active: '../../0/on === true',
                inactiveValue: resolver,
              },
            },
          },
        },
      },
    },
  });
  root.setValue({
    rows: [
      { on: true, note: 'n0' },
      { on: false, note: 'n1' },
    ],
  });
  const rows = root.find('/rows')!;
  if (rows.type !== 'array') throw new Error('Expected array');
  const slots = vi.spyOn(slotApplication, 'applyArraySlots');
  const splice = vi.spyOn(spliceApplication, 'applyArraySplice');
  try {
    rows.remove(0);
    expect(slots).toHaveBeenCalledTimes(1);
    expect(splice).not.toHaveBeenCalled();
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(root.inactiveValues).toEqual([
      { path: '/rows/0/note', value: 'n1-exit' },
    ]);
  } finally {
    slots.mockRestore();
    splice.mockRestore();
  }
});
