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

const observed = vi.hoisted(() => ({ prunes: 0, fast: [] as boolean[] }));
vi.mock('../utils/latentStore/pruneLatentRaw', async (load) => {
  const actual =
    await load<typeof import('../utils/latentStore/pruneLatentRaw')>();
  return {
    ...actual,
    pruneLatentRaw: (...args: Parameters<typeof actual.pruneLatentRaw>) => {
      observed.prunes++;
      return actual.pruneLatentRaw(...args);
    },
  };
});
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
  observed.prunes = 0;
  observed.fast.length = 0;
}

it('H4 keeps the scalar fast path when an exited array item owns an unrelated latent value', () => {
  const { root, leaf, other, seen } = createScopeTree();
  const retired = getDispatchNode(root, 'other', '0');
  dispatchSetValue(other, []);
  expect(retired.detached).toBe(true);
  dispatchSetValue(retired, 11);
  expect(root.runtime.blueprint.capabilities.branchless).toBe(true);
  const key = JSON.stringify(['/other/0', 'number']);
  expect(root.runtime.latentRaw.get(key)).toBe(11);
  seen.length = 0;
  beginObservation();

  dispatchSetValue(leaf, 1);

  expect(observed.fast).toEqual([true]);
  expect(observed.prunes).toBe(0);
  expect(root.emit).toEqual({ group: { stable: 1 }, other: [] });
  expect(root.runtime.latentRaw.get(key)).toBe(11);
  expect(seen).toEqual(['', '/group', '/group/stable']);
});

it.each([
  ['/group/stable', 'string'],
  ['/group/stable/hidden', 'number'],
])(
  'H4 uses the ordinary path and clears covered latent slot %s',
  (path, kind) => {
    const { root, leaf, seen } = createScopeTree();
    const key = JSON.stringify([path, kind]);
    root.runtime.latentRaw.set(key, 99);
    beginObservation();

    dispatchSetValue(leaf, 1);

    expect(observed.fast).toEqual([false]);
    expect(observed.prunes).toBe(1);
    expect(root.runtime.latentRaw.has(key)).toBe(false);
    expect(root.emit).toEqual({ group: { stable: 1 }, other: [7] });
    expect(seen).toEqual(['', '/group', '/group/stable']);
  },
);

it('H4 keeps the ordinary path for a same-path other-kind slot of an ancestor', () => {
  const { root, leaf, seen } = createScopeTree();
  const key = JSON.stringify(['/group', 'string']);
  root.runtime.latentRaw.set(key, 'retained');
  beginObservation();

  dispatchSetValue(leaf, 1);

  expect(observed.fast).toEqual([false]);
  expect(observed.prunes).toBe(1);
  expect(root.runtime.latentRaw.get(key)).toBe('retained');
  expect(root.emit).toEqual({ group: { stable: 1 }, other: [7] });
  expect(seen).toEqual(['', '/group', '/group/stable']);
});
