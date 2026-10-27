import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { isArrayNode } from '@/schema-form/core/surface';

import { readRetainedSlotRaw } from '../../__tests__/fixtures/readRetainedSlotRaw';

// 446C-07 (가): A detached field write must follow its surviving item to the new index.
it('keeps a detached field write with its surviving array item after remove(0)', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            gated: { type: 'string', controls: { active: '../flag' } },
          },
        },
      },
    },
  });
  root.setValue({
    items: [
      { flag: true, gated: 'first' },
      { flag: true, gated: 'second' },
      { flag: true, gated: 'third' },
    ],
  });
  const items = root.find('/items');
  const survivor = root.find('/items/2');
  const ref = root.find('/items/2/gated');
  if (!items || !isArrayNode(items) || !survivor || !ref)
    throw new Error('Expected three mounted object items and their fields');
  expect(ref.value).toBe('third');
  root.find('/items/2/flag')!.setValue(false);
  expect(root.find('/items/2/gated')).toBeNull();

  items.remove(0);
  expect(root.find('/items/1')).toBe(survivor);
  expect(survivor.path).toBe('/items/1');
  ref.setValue('x');
  const retainedAfterWrite = {
    moved: readRetainedSlotRaw(root, '/items/1/gated', 'string'),
    former: readRetainedSlotRaw(root, '/items/2/gated', 'string'),
  };
  expect(ref.path).toBe('/items/2/gated');
  expect(ref.value).toBe('third');
  root.find('/items/0/flag')!.setValue(true);
  root.find('/items/1/flag')!.setValue(true);

  expect({
    retainedAfterWrite,
    firstSurvivor: root.find('/items/0/gated')!.value,
    movedSurvivor: root.find('/items/1/gated')!.value,
    absentTail: root.find('/items/2'),
  }).toEqual({
    retainedAfterWrite: { moved: 'x', former: undefined },
    firstSurvivor: 'second',
    movedSurvivor: 'x',
    absentTail: null,
  });
});
