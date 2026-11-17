import { expect, it, vi } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

// filid:contract surface-slot-old-subscriptions
it('keeps the retained source subscriptions silent during a new lifetime', () => {
  const tree = createRetainedSlotTree();
  const groupListener = vi.fn();
  const leafListener = vi.fn();
  tree.group.subscribe(groupListener);
  tree.leaf.subscribe(leafListener);
  tree.close();
  groupListener.mockClear();
  leafListener.mockClear();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.open();
  const live = tree.root.find('/group/leaf')!;
  const liveListener = vi.fn();
  live.subscribe(liveListener);
  live.setValue('changed');
  live.setState({ touched: true });
  expect(liveListener).toHaveBeenCalled();
  expect(groupListener).not.toHaveBeenCalled();
  expect(leafListener).not.toHaveBeenCalled();
});
