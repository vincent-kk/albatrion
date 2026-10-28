// filid:contract settle-write
import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '../../record';
import {
  dispatchMount,
  dispatchSetValue,
  subscribeFieldNode,
} from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

const observed = vi.hoisted(() => ({ fast: [] as boolean[] }));
vi.mock('../utils/settlement/finishSettlement', async (load) => {
  const actual =
    await load<typeof import('../utils/settlement/finishSettlement')>();
  return {
    ...actual,
    finishSettlement: (...args: Parameters<typeof actual.finishSettlement>) => {
      observed.fast.push(args[2] ?? false);
      return actual.finishSettlement(...args);
    },
  };
});

function createScopeTree() {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      group: { type: 'object', properties: { stable: { type: 'number' } } },
      other: { type: 'array', items: { type: 'number' } },
    },
  });
  dispatchMount(root, { group: { stable: 0 }, other: [7] });
  const group = getDispatchNode(root, 'group');
  const leaf = getDispatchNode(root, 'group', 'stable');
  const other = getDispatchNode(root, 'other');
  const seen: string[] = [];
  for (const node of [root, group, leaf])
    subscribeFieldNode(node, (event) => {
      if (event.type & FieldNodeEventType.UpdateValue) seen.push(node.path);
    });
  return { root, leaf, other, seen };
}

function beginObservation() {
  observed.fast.length = 0;
}

it('H4 keeps the scalar fast path after an ignored exited-item write', () => {
  const { root, leaf, other, seen } = createScopeTree();
  const retired = getDispatchNode(root, 'other', '0');
  dispatchSetValue(other, []);
  expect(retired.detached).toBe(true);
  dispatchSetValue(retired, 11);
  expect(root.runtime.blueprint.capabilities.branchless).toBe(true);
  expect(readRetainedSlotRaw(root, '/other/0', 'number')).toBeUndefined();
  seen.length = 0;
  beginObservation();

  dispatchSetValue(leaf, 1);

  expect(observed.fast).toEqual([true]);
  expect(root.emit).toEqual({ group: { stable: 1 } });
  expect(readRetainedSlotRaw(root, '/other/0', 'number')).toBeUndefined();
  expect(seen).toEqual(['', '/group', '/group/stable']);
});
