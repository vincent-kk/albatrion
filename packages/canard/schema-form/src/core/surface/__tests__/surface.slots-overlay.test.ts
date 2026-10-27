import { expect, it } from 'vitest';

import { SetValueOption } from '../type';
import { createRetainedSlotTree } from './fixtures/createRetainedSlotTree';

it('applies a detached leaf overlay at clone without changing its frozen source', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.leaf.setValue('overlay');
  expect(tree.leaf.raw).toBe('kept');
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBe('overlay');
  expect(tree.root.find('/group')!.undeclaredValues).toEqual({
    extra: { retained: true },
  });
});

it('clears absent slot descendants on whole replacement through an old host', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.group.setValue({ leaf: 'replacement' });
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBe('replacement');
  expect(tree.root.find('/group')!.undeclaredValues).toBeUndefined();
  expect(tree.root.find('/group')!.inactiveValues).toEqual([]);
  expect(tree.leaf.raw).toBe('kept');
});

it('merges a host overlay while retaining unwritten descendants and extras', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.group.setValue({ leaf: 'merged' }, SetValueOption.Merge);
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBe('merged');
  expect(tree.root.find('/group/list/0')!.value).toEqual({ text: 'first' });
  expect(tree.root.find('/group')!.undeclaredValues).toEqual({
    extra: { retained: true },
  });
  expect(tree.root.find('/group')!.inactiveValues).toEqual([
    { path: '/group/held', value: 'hidden' },
  ]);
});

it('drops slot sources absent from a live root whole replacement', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.root.setValue({ open: false });
  expect(tree.root.inactiveValues).toEqual([]);
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBeUndefined();
  expect(tree.root.find('/group')!.undeclaredValues).toBeUndefined();
  expect(tree.leaf.raw).toBe('kept');
});

it('replaces a supplied inactive subtree through a root write without mutating its slot', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.root.setValue({ open: false, group: { leaf: 'root overlay' } });
  expect(tree.group.value).toMatchObject({ leaf: 'kept' });
  expect(tree.root.inactiveValues).toEqual([
    { path: '/group/leaf', value: 'root overlay' },
  ]);
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBe('root overlay');
  expect(tree.root.find('/group')!.inactiveValues).toEqual([]);
  expect(tree.root.find('/group')!.undeclaredValues).toBeUndefined();
});

it('ignores an old reference write while the same kind has a live lifetime', () => {
  const tree = createRetainedSlotTree();
  tree.close();
  expect(Reflect.get(tree.root, 'inactiveSlots')).toBeInstanceOf(Map);
  tree.open();
  tree.leaf.setValue('ignored');
  expect(tree.root.find('/group/leaf')!.raw).toBe('kept');
  tree.close();
  tree.leaf.setValue('latest absent source');
  tree.open();
  expect(tree.root.find('/group/leaf')!.raw).toBe('latest absent source');
});
