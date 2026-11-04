import { describe, expect, it } from 'vitest';

import type { SplitBucket } from '../../../types/splitRegistration';
import { DirtyPathSet } from '../DirtyPathSet';

/** Build immutable rank evidence with one live non-representative member. */
const fixture = () => {
  const bucket: SplitBucket = {
    hostPath: '/h',
    firstRank: 0,
    ranksByName: new Map([['a', 0], ['b', 1]]),
    runs: [{ ranks: [0, 1], firstRank: 0 }],
    runByName: new Map([['a', 0], ['b', 0]]),
  };
  const dirty = new DirtyPathSet(new Map());
  dirty.configureSplitOwners(new Map([
    ['/h/a', { bucket, rank: 0, run: 0 }],
    ['/h/b', { bucket, rank: 1, run: 0 }],
  ]));
  return { bucket, dirty };
};

describe('compressed split anchor lifetime', () => {
  it('V8 keeps the anchor when a live non-representative member is deleted', () => {
    const { bucket, dirty } = fixture();
    for (const event of dirty.planSplitAnchors(bucket, [1], 1)) event.insert();
    dirty.add('/h/b');
    dirty.add('/g/x');
    dirty.delete('/h/b');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['h', 'g']);
    expect([...dirty]).toEqual(['/g/x']);
    dirty.add('/h/a');
    dirty.delete('/h/a');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g']);
  });

  it('re-represents released dormant members without re-counting live members', () => {
    const { bucket, dirty } = fixture();
    for (const event of dirty.planSplitAnchors(bucket, [1], 1)) event.insert();
    dirty.add('/h/a');
    dirty.delete('/h/a');
    dirty.add('/g/x');
    for (const event of dirty.planSplitAnchors(bucket, [1], 2)) event.insert();
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g', 'h']);
    dirty.add('/h/a');
    dirty.delete('/h/a');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g']);
  });

  it('anchors retain escaped names and clear every reference with scratch', () => {
    const { bucket, dirty } = fixture();
    const escaped = { ...bucket, hostPath: '/a~1b/h~0x' };
    dirty.configureSplitOwners(new Map([
      ['/a~1b/h~0x/a', { bucket: escaped, rank: 0, run: 0 }],
      ['/a~1b/h~0x/b', { bucket: escaped, rank: 1, run: 0 }],
    ]));
    for (const event of dirty.planSplitAnchors(escaped, [1], 1)) event.insert();
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['a~1b']);
    expect([...dirty.childrenByParent.get('/a~1b')!.values()]).toEqual(['h~0x']);
    expect(dirty.childrenByParent.has(escaped.hostPath)).toBe(false);
    expect(dirty.size).toBe(0);
    dirty.clear();
    expect(dirty.childrenByParent.size).toBe(0);
    for (const event of dirty.planSplitAnchors(escaped, [1], 2)) event.insert();
    expect(dirty.childrenByParent.size).toBe(2);
  });

  it('keeps two static runs on opposite sides of a foreign owner', () => {
    const { bucket, dirty } = fixture();
    const runs = { ...bucket, ranksByName: new Map([['a', 0], ['b', 2]]),
      runs: [{ ranks: [0], firstRank: 0 }, { ranks: [2], firstRank: 2 }],
      runByName: new Map([['a', 0], ['b', 1]]) };
    dirty.configureSplitOwners(new Map([
      ['/h/a', { bucket: runs, rank: 0, run: 0 }],
      ['/h/b', { bucket: runs, rank: 2, run: 1 }],
    ]));
    const events = dirty.planSplitAnchors(runs, [], 1);
    expect(events.map((event) => event.rank)).toEqual([0, 2]);
    events[0].insert();
    dirty.add('/g/x');
    events[1].insert();
    dirty.add('/h/a');
    dirty.delete('/h/a');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g', 'h']);
  });
});
