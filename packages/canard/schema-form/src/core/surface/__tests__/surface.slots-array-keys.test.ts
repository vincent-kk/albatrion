import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-array-keys
it('issues fresh array item keys when cloning a retained array subtree', () => {
  const tree = createRetainedSlotTree();
  const oldKey = Reflect.get(tree.item, '__itemKey__');
  tree.close();
  expect(Reflect.get(tree.root, '__inactiveSlots__')).toBeInstanceOf(Map);
  tree.open();
  const item = tree.root.find('/group/list/0')!;
  expect(item).not.toBe(tree.item);
  expect(Reflect.get(item, '__itemKey__')).not.toBe(oldKey);
  expect(item.value).toEqual({ text: 'first' });
  const firstNewKey = Reflect.get(item, '__itemKey__');
  tree.close();
  tree.open();
  expect(Reflect.get(tree.root.find('/group/list/0')!, '__itemKey__')).not.toBe(
    firstNewKey,
  );
  expect(Reflect.get(tree.item, '__itemKey__')).toBe(oldKey);
});
