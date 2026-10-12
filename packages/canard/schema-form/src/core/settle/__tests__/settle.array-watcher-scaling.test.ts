import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SchemaNode } from '../../SchemaNode/SchemaNode';
import { SchemaNodeEventType } from '../../record';
import * as deliveries from '../utils/commit/markCommitDeliveries';

const makeWatchedTree = (count: number) => {
  const { root } = makeSchemaNodeTree({ type: 'object', properties: {
    flag: { type: 'string' }, list: { type: 'array', items: { type: 'object',
      properties: { key: { type: 'number' }, watch: { type: 'string',
        controls: { watch: ['../key'] } } } } },
    others: { type: 'array', items: { type: 'object', properties: {
      watch: { type: 'string', controls: { watch: ['../../../flag'] } },
    } } },
  } });
  if (!(root instanceof SchemaNode)) throw new Error('Expected runtime tree');
  root.setValue({ flag: 'a', list: Array.from({ length: 8 }, (_, key) =>
    ({ key, watch: 'x' })), others: Array.from({ length: count }, () =>
    ({ watch: 'y' })) });
  return root;
};

describe('I9 array costs follow changed paths', () => {
  it('44C-01 SETTLE-017 does not iterate unrelated watchers on remove', () => {
    const root = makeWatchedTree(2000);
    const watchers = root.runtime.deliveryWatchIndex!.allNodes;
    const iterate = watchers[Symbol.iterator].bind(watchers);
    let visits = 0;
    const spy = vi.spyOn(watchers, Symbol.iterator).mockImplementation(function* () {
      for (const watcher of iterate()) { visits++; yield watcher; }
      return undefined;
    });
    try {
      (root.find('/list') as SchemaNode).remove(6);
      expect(visits, `whole watcher visits: ${visits}`).toBeLessThan(16);
    } finally { spy.mockRestore(); }
  });

  it('44C-01 isolates indexed outside watcher deliveries after a shift', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      list: { type: 'array', items: { type: 'object', properties: {
        key: { type: 'number' },
      } } },
      leafWatcher: { type: 'string', controls: { watch: ['../list/3/key'] } },
      hostWatcher: { type: 'string', controls: { watch: ['../list'] } },
    } });
    if (!(root instanceof SchemaNode)) throw new Error('Expected runtime tree');
    root.setValue({ list: Array.from({ length: 5 }, (_, key) => ({ key })) });
    const watchers = [root.find('/leafWatcher') as SchemaNode,
      root.find('/hostWatcher') as SchemaNode];
    const bit = SchemaNodeEventType.UpdateComputedProperties;
    const before = watchers.map((watcher) => watcher.revisionLedger[bit] ?? 0);
    const allNodes = root.runtime.deliveryWatchIndex!.allNodes;
    const iterate = allNodes[Symbol.iterator].bind(allNodes);
    let wholeVisits = 0;
    const all = vi.spyOn(allNodes, Symbol.iterator).mockImplementation(function* () {
      for (const watcher of iterate()) { wholeVisits++; yield watcher; }
      return undefined;
    });
    const mark = deliveries.markCommitDeliveries;
    let outsideCandidates = 0;
    const spy = vi.spyOn(deliveries, 'markCommitDeliveries').mockImplementation((context) => {
      for (const watcher of watchers)
        if (context.changedNodes.has(watcher) || context.entered.has(watcher) ||
          context.stateDirtyNodes.has(watcher) ||
          context.pathChanges.some((change) => change.node === watcher)) outsideCandidates++;
      // Isolate commit delivery: authored watches also register recomputation dependencies.
      for (const watcher of watchers) {
        context.changedNodes.delete(watcher);
        context.stateDirtyNodes.delete(watcher);
      }
      mark(context);
    });
    try {
      (root.find('/list') as SchemaNode).remove(1);
      expect(outsideCandidates).toBe(2);
      expect(wholeVisits).toBe(0);
      expect(watchers.map((watcher) => watcher.revisionLedger[bit] ?? 0))
        .toEqual(before.map((revision) => revision + 1));
    } finally { spy.mockRestore(); all.mockRestore(); }
  });
});
