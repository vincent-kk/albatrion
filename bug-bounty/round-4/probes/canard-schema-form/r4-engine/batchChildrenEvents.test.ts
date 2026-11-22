import { describe, expect, it } from 'vitest';

import { FieldNodeEventType } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' } } },
    },
  },
} as const;

const scenario = (mode: 'sequential' | 'batch', calls: (list: any) => void) => {
  const { root, changes } = build(schema, { list: [{ name: 'a' }, { name: 'b' }] });
  const list = root.find('/list');
  const before = [...list.children];
  let childrenEvents = 0;
  let renderedChildren = before;
  list.subscribe((event: any) => {
    if (event.type & FieldNodeEventType.UpdateChildren) {
      childrenEvents++;
      renderedChildren = [...list.children];
    }
  });
  changes.length = 0;
  if (mode === 'batch') root.batch(() => calls(list));
  else calls(list);
  const after = list.children;
  return {
    childrenEvents,
    sameNodes: after.map((node: any, i: number) => node === before[i]),
    renderedIsCurrent: renderedChildren.every((node: any, i: number) => node === after[i]),
    renderedDetached: renderedChildren.map((node: any) => node.isDetached),
    value: root.value,
    changes: changes.length,
  };
};

describe('UpdateChildren after batched verbs that return to equal content', () => {
  const cases: Record<string, (list: any) => void> = {
    'remove(0) then insert(0, the same value)': (list) => {
      const removed = list.remove(0);
      list.insert(0, removed);
    },
    'pop() then push(the same value)': (list) => {
      const popped = list.pop();
      list.push(popped);
    },
    'clear() then setValue of the same items': (list) => {
      list.clear();
      list.push({ name: 'a' });
      list.push({ name: 'b' });
    },
  };
  for (const [name, calls] of Object.entries(cases)) {
    it(`C ${name}: a subscriber that re-reads children on UpdateChildren ends on the live nodes`, () => {
      const sequential = scenario('sequential', calls);
      const batched = scenario('batch', calls);
      diag(`C ${name}`, { sequential, batched });
      expect(batched.sameNodes).toEqual(sequential.sameNodes);
      expect(batched.renderedIsCurrent).toBe(true);
    });
  }
});
