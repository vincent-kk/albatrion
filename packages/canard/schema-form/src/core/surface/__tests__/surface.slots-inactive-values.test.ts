import { expect, it } from 'vitest';

import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

it('materializes nested slot values in document order with frozen stable references', () => {
  const tree = createRetainedSlotTree();
  const activeHost = tree.group.inactiveValues;
  expect(Reflect.get(tree.group, 'inactiveSlots')).toBeInstanceOf(Map);
  expect(activeHost).toEqual([{ path: '/group/held', value: 'hidden' }]);
  expect(tree.group.inactiveValues).toBe(activeHost);
  tree.close();
  expect(tree.group.inactiveValues).toBe(activeHost);
  const inactive = tree.root.inactiveValues;
  expect(inactive).toEqual([
    { path: '/group/childOpen', value: false },
    { path: '/group/leaf', value: 'kept' },
    { path: '/group/held', value: 'hidden' },
    { path: '/group/list', value: [{ text: 'first' }] },
  ]);
  expect(Object.isFrozen(inactive)).toBe(true);
  expect(inactive.every(Object.isFrozen)).toBe(true);
  expect(tree.root.inactiveValues).toBe(inactive);
  tree.leaf.setValue('overlay');
  expect(tree.root.inactiveValues).toBe(inactive);
  tree.close();
  expect(tree.root.inactiveValues).not.toBe(inactive);
  expect(tree.group.inactiveValues).toBe(activeHost);
  expect(inactive[1]).toEqual({ path: '/group/leaf', value: 'kept' });
});

it('keeps unread detached slot reads independent of later writes and re-entry', () => {
  const tree = createRetainedSlotTree();
  expect(Reflect.get(tree.group, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.close();
  tree.held.setValue('overlay');
  tree.open();
  expect(tree.group.inactiveValues).toEqual([
    { path: '/group/held', value: 'hidden' },
  ]);
  const frozen = tree.group.inactiveValues;
  expect(tree.root.find('/group')!.inactiveValues).toEqual([
    { path: '/group/held', value: 'overlay' },
  ]);
  tree.root.resetSubtree();
  expect(tree.group.inactiveValues).toBe(frozen);
});

it('does not republish an untouched host when a sibling branch changes', () => {
  const tree = createRetainedSlotTree();
  const held = tree.group.inactiveValues;
  expect(Reflect.get(tree.group, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.root.find('/group/leaf')!.setValue('changed');
  expect(tree.group.inactiveValues).toBe(held);
  expect(tree.root.inactiveValues[0]).toBe(held[0]);
});
