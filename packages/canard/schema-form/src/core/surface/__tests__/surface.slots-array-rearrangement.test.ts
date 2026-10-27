import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

/** Create two item hosts whose visited fields are both currently inactive. */
const createArraySlotTree = () => {
  const { root } = makeFieldNodeTree({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        held: { type: 'string', controls: { active: '../enabled' } },
      },
    },
  });
  if (root.type !== 'array') throw new Error('Expected array root');
  root.setValue([
    { enabled: true, held: 'first' },
    { enabled: true, held: 'second' },
  ]);
  const first = root.find('/0')!;
  const second = root.find('/1')!;
  const secondHeld = root.find('/1/held')!;
  root.find('/0/enabled')!.setValue(false);
  root.find('/1/enabled')!.setValue(false);
  expect(Reflect.get(second, 'inactiveSlots')).toBeInstanceOf(Map);
  return { root, first, second, secondHeld };
};

it('preserves inactive sources at their moved paths while freezing a perished host', () => {
  const { root, first } = createArraySlotTree();
  const frozen = first.inactiveValues;
  root.remove(0);
  expect(root.inactiveValues).toEqual([{ path: '/0/held', value: 'second' }]);
  expect(first.inactiveValues).toBe(frozen);
  expect(first.inactiveValues).toEqual([{ path: '/0/held', value: 'first' }]);
  root.find('/0/enabled')!.setValue(true);
  expect(root.find('/0/held')!.value).toBe('second');
  root.clear();
  expect(root.inactiveValues).toEqual([]);
  expect(first.inactiveValues).toBe(frozen);
});

it('carries inactive overlays and old-reference write addresses through removal', () => {
  const { root, secondHeld } = createArraySlotTree();
  secondHeld.setValue('before move');
  root.remove(0);
  expect(secondHeld.path).toBe('/1/held');
  secondHeld.setValue('after move');
  expect(root.inactiveValues).toEqual([
    { path: '/0/held', value: 'before move' },
  ]);
  root.find('/0/enabled')!.setValue(true);
  expect(root.find('/0/held')!.value).toBe('after move');
  expect(secondHeld.value).toBe('second');
});

it('moves every inactive slot when insertion shifts existing item hosts', () => {
  const { root } = createArraySlotTree();
  root.insert(0, { enabled: false });
  expect(root.inactiveValues).toEqual([
    { path: '/1/held', value: 'first' },
    { path: '/2/held', value: 'second' },
  ]);
  root.find('/1/enabled')!.setValue(true);
  root.find('/2/enabled')!.setValue(true);
  expect(root.find('/1/held')!.value).toBe('first');
  expect(root.find('/2/held')!.value).toBe('second');
});
