import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-frozen-reads
it('reads a retained detached host without observing later overlays or reset', () => {
  const tree = createRetainedSlotTree();
  const value = tree.group.value;
  const source = tree.leaf.source;
  const children = tree.group.children;
  const extras = tree.group.extras;
  const inactive = tree.group.inactiveValues;
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.leaf.setValue('overlay');
  tree.open();
  expect(tree.root.find('/group/leaf')!.value).toBe('kept');
  tree.root.find('/group/leaf')!.setValue('new lifetime');
  tree.root.resetSubtree();
  expect(tree.group.value).toBe(value);
  expect(tree.leaf.source).toBe(source);
  expect(tree.group.children).toBe(children);
  expect(tree.group.extras).toBe(extras);
  expect(tree.group.inactiveValues).toBe(inactive);
  expect(Object.isFrozen(inactive)).toBe(true);
  expect(inactive).toEqual([{ path: '/group/held', value: 'hidden' }]);
});
