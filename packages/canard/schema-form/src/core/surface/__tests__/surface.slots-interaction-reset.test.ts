import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-interaction-reset
it('clones sources without carrying interaction or external errors into re-entry', () => {
  const tree = createRetainedSlotTree();
  tree.group.setState({ edited: true, touched: true });
  tree.leaf.setState({ edited: true, touched: true });
  tree.leaf.setExternalErrors([
    { dataPath: '/group/leaf', message: 'external' },
  ]);
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.open();
  const group = tree.root.find('/group')!;
  const leaf = tree.root.find('/group/leaf')!;
  expect(group.state).toEqual({});
  expect(leaf.state).toEqual({});
  expect(leaf.errors).toEqual([]);
  expect(leaf.value).toBe('kept');
  expect(tree.leaf.state).toEqual({ edited: true, touched: true });
  expect(tree.leaf.errors).toEqual([
    { dataPath: '/group/leaf', message: 'external' },
  ]);
});
