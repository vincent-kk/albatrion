import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-array-keys
it('issues fresh array item keys when cloning a retained array subtree', () => {
  const tree = createRetainedSlotTree();
  const oldKey = Reflect.get(tree.item, 'itemKey');
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.open();
  const item = tree.root.find('/group/list/0')!;
  expect(item).not.toBe(tree.item);
  expect(Reflect.get(item, 'itemKey')).not.toBe(oldKey);
  expect(item.value).toEqual({ text: 'first' });
  const firstNewKey = Reflect.get(item, 'itemKey');
  tree.close();
  tree.open();
  expect(Reflect.get(tree.root.find('/group/list/0')!, 'itemKey')).not.toBe(
    firstNewKey,
  );
  expect(Reflect.get(tree.item, 'itemKey')).toBe(oldKey);
});
