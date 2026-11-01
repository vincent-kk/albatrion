import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-new-instance
it('retains the detached source while re-entry issues a new subtree', () => {
  const tree = createRetainedSlotTree();
  const value = tree.group.value;
  const extras = tree.group.undeclaredValues;
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.open();
  expect(tree.root.find('/group')).not.toBe(tree.group);
  expect(tree.root.find('/group/leaf')).not.toBe(tree.leaf);
  expect(tree.root.find('/group/list/0')).not.toBe(tree.item);
  expect(tree.root.find('/group')!.value).toEqual(value);
  expect(tree.root.find('/group')!.undeclaredValues).toEqual(extras);
  expect(Reflect.get(tree.group, 'detached')).toBe(true);
  expect(Reflect.get(tree.leaf, 'detached')).toBe(true);
  expect(tree.group.isActive).toBe(false);
  expect(tree.leaf.isActive).toBe(false);
});
