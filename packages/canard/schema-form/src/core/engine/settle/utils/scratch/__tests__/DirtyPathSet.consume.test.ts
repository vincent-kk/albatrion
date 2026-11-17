import { afterEach, describe, expect, it } from 'vitest';

import { engineModes } from '../../../../utils/cache/engineModes';
import type { SplitBucket } from '../../../types/splitRegistration';
import { gateSelectionTable } from '../../gates/gateSelectionTable';
import { DirtyPathSet } from '../DirtyPathSet';

const previousMode = engineModes.gateSelection;
const previous = { ...gateSelectionTable };
afterEach(() => {
  Object.assign(gateSelectionTable, previous);
  engineModes.setMode('gateSelection', previousMode);
});

/** A non-root split host with one dormant representative and one live member. */
const splitFixture = () => {
  const bucket: SplitBucket = {
    hostPath: '/h',
    firstRank: 0,
    ranksByName: new Map([
      ['a', 0],
      ['b', 1],
    ]),
    runs: [{ ranks: [0, 1], firstRank: 0 }],
    runByName: new Map([
      ['a', 0],
      ['b', 0],
    ]),
  };
  const dirty = new DirtyPathSet(new Map());
  dirty.configureSplitOwners(
    new Map([
      ['/h/a', { bucket, rank: 0, run: 0 }],
      ['/h/b', { bucket, rank: 1, run: 0 }],
    ]),
  );
  for (const event of dirty.planSplitAnchors(bucket, [1], 1)) event.insert();
  return { dirty, bucket };
};

describe('settled dirty consumption', () => {
  it('consumes a plain post-order leaf and drops retained edges with its parent', () => {
    const dirty = new DirtyPathSet(new Map());
    dirty.beginPostOrder();
    dirty.add('/h/a');
    expect(dirty.consume('/h/a')).toBe(true);
    expect([...dirty]).toEqual(['/h', '']);
    expect([...dirty.childrenByParent.get('/h')!.values()]).toEqual(['a']);
    expect(dirty.consume('/h')).toBe(true);
    expect(dirty.childrenByParent.has('/h')).toBe(false);
    dirty.consume('');
    expect(dirty.childrenByParent.size).toBe(0);
    expect(dirty.consume('/h/a')).toBe(false);
  });

  it('keeps a dormant anchor when consuming an excluded live split member', () => {
    const { dirty } = splitFixture();
    dirty.add('/h/b');
    dirty.add('/g/x');
    dirty.consume('/h/b');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['h', 'g']);
    expect([...dirty]).toEqual(['/g/x']);
  });

  it('releases the last represented split member and permits re-representation', () => {
    const { dirty, bucket } = splitFixture();
    dirty.add('/h/a');
    dirty.add('/g/x');
    dirty.consume('/h/a');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g']);
    for (const event of dirty.planSplitAnchors(bucket, [1], 2)) event.insert();
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g', 'h']);
    dirty.add('/h/a');
    dirty.consume('/h/a');
    expect([...dirty.childrenByParent.get('')!.values()]).toEqual(['g']);
  });

  it('rejects an unconsumed child in verify mode before changing either container', () => {
    engineModes.setMode('gateSelection', 'verify');
    const dirty = new DirtyPathSet(new Map());
    dirty.beginPostOrder();
    dirty.add('/h/a');
    const before = [...dirty];
    expect(() => dirty.consume('/h')).toThrow(
      'S6 consume has an unconsumed child',
    );
    expect([...dirty]).toEqual(before);
    expect([...dirty.childrenByParent.get('/h')!.values()]).toEqual(['a']);
    expect(gateSelectionTable.violations).toBe(previous.violations + 1);
  });

  it('falls back to delete outside post-order when a child is still dirty', () => {
    const dirty = new DirtyPathSet(new Map());
    dirty.add('/h');
    dirty.add('/h/a');
    dirty.consume('/h');
    expect([...dirty]).toEqual(['/h/a']);
    expect([...dirty.childrenByParent.get('/h')!.values()]).toEqual(['a']);
  });

  it('recreates an escaped child name after its parent was consumed in the same frontier', () => {
    for (const mode of ['off', 'table', 'verify'] as const) {
      engineModes.setMode('gateSelection', mode);
      const dirty = new DirtyPathSet(new Map());
      const reference = new DirtyPathSet(new Map());
      for (const set of [dirty, reference]) {
        set.beginPostOrder();
        set.add('/h/a~1b');
        set.add('/other');
      }
      dirty.consume('/h/a~1b');
      reference.delete('/h/a~1b');
      dirty.consume('/h');
      reference.delete('/h');
      for (const set of [dirty, reference]) set.add('/h/a~1b');
      expect([...dirty]).toEqual([...reference]);
      expect([...dirty.childrenByParent.get('/h')!]).toEqual([
        ...reference.childrenByParent.get('/h')!,
      ]);
      // Retained ancestors can differ internally; actual live name order must not.
      expect([...new Set(dirty.childrenByParent.get('')!.values())]).toEqual([
        ...new Set(reference.childrenByParent.get('')!.values()),
      ]);
    }
  });
});
