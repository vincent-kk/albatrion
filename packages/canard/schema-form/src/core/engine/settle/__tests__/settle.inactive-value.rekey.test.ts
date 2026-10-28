import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

import type { InactiveValueContext } from '../../types/controls';
import * as slotApplication from '../arrangeFieldNodeItems/utils/arraySlots/applyArraySlots';
import * as spliceApplication from '../arrangeFieldNodeItems/utils/arraySlots/applyArraySplice';

it.each(['declaration', 'listener'])(
  'reads the moved occurrence at its preceding committed path through a %s',
  (source) => {
    const resolve = vi.fn(
      (value: unknown, _context: InactiveValueContext) =>
        String(value) + '-exit',
    );
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
                  ...(source === 'declaration'
                    ? { inactiveValue: resolve }
                    : {}),
                },
              },
            },
          },
        },
      },
    });
    const before = {
      rows: [
        { on: true, note: 'n0' },
        { on: false, note: 'n1' },
      ],
    };
    root.setValue(before);
    const moved = root.find('/rows/1/note')!;
    const oldSchema = moved.jsonSchema;
    const oldParentSchema = moved.parentNode!.jsonSchema;
    if (source === 'listener') moved.onInactive(resolve);
    const rows = root.find('/rows')!;
    if (rows.type !== 'array') throw new Error('Expected array');
    const slots = vi.spyOn(slotApplication, 'applyArraySlots');
    const splice = vi.spyOn(spliceApplication, 'applyArraySplice');
    try {
      rows.remove(0);
      expect(slots).toHaveBeenCalledTimes(1);
      expect(splice).not.toHaveBeenCalled();
    } finally {
      slots.mockRestore();
      splice.mockRestore();
    }
    expect(resolve).toHaveBeenCalledTimes(1);
    const [value, context] = resolve.mock.calls[0];
    expect(value).toBe('n1');
    expect(context.dataPath).toBe('/rows/1/note');
    expect(context.parentValue).toEqual(before.rows[1]);
    expect(context.rootValue).toEqual(before);
    expect(context.jsonSchema).toBe(oldSchema);
    expect(context.parentJSONSchema).toBe(oldParentSchema);
    expect(moved.path).toBe('/rows/0/note');
    expect(root.inactiveValues).toEqual([
      { path: '/rows/0/note', value: 'n1-exit' },
    ]);
  },
);

it('keeps each preceding snapshot when multiple moved items occupy old addresses', () => {
  const resolve = vi.fn(
    (value: unknown, _context: InactiveValueContext) => value,
  );
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
                inactiveValue: resolve,
              },
            },
          },
          allOf: [{ controls: { active: './on' }, title: 'enabled item' }],
        },
      },
    },
  });
  root.setValue({
    rows: [
      { on: true, note: 'n0' },
      { on: false, note: 'n1' },
      { on: true, note: 'n2' },
    ],
  });
  const oldParent = root.find('/rows/1')!.jsonSchema;
  const otherParent = root.find('/rows/2')!.jsonSchema;
  const rows = root.find('/rows')!;
  if (rows.type !== 'array') throw new Error('Expected array');
  rows.remove(0);
  const call = resolve.mock.calls.find(
    ([, context]) => context.dataPath === '/rows/1/note',
  );
  expect(call?.[0]).toBe('n1');
  expect(call?.[1].parentJSONSchema).toBe(oldParent);
  expect(resolve.mock.calls.map(([value]) => value)).toEqual(['n1', 'n2']);
  expect(resolve.mock.calls[1][1].dataPath).toBe('/rows/2/note');
  expect(resolve.mock.calls[1][1].parentJSONSchema).toBe(otherParent);
  expect(root.inactiveValues).toEqual([
    { path: '/rows/0/note', value: 'n1' },
    { path: '/rows/1/note', value: 'n2' },
  ]);
});
