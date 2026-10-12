import { describe, expect, it } from 'vitest';
import { PathKeyedMap } from '../PathKeyedMap';
import { PathKeyedSet } from '../PathKeyedSet';

describe('explicit runtime path indexes', () => {
  it('keeps native Map/Set iteration and prototype mutation methods', () => {
    const map = new PathKeyedMap('path', [['/a', 1]]);
    const set = new PathKeyedSet(['/a']);
    expect(map).toBeInstanceOf(Map);
    expect(set).toBeInstanceOf(Set);
    expect([...map]).toEqual([['/a', 1]]);
    expect([...set]).toEqual(['/a']);
    for (const method of ['set', 'delete', 'clear'])
      expect(Object.getOwnPropertyDescriptor(map, method)).toBeUndefined();
    for (const method of ['add', 'delete', 'clear'])
      expect(Object.getOwnPropertyDescriptor(set, method)).toBeUndefined();
  });

  it('maintains pair ancestry on insert, overwrite, delete, and clear', () => {
    const key = JSON.stringify(['/a~1b//leaf', 'string']);
    const value = { source: 'held' };
    const store = new PathKeyedMap('pair', [[key, value]]);
    expect(store.get(key)).toBe(value);
    expect([...store.pathIndex.under('/a~1b/')]).toEqual([key]);
    store.set(key, { source: 'new' });
    expect([...store.pathIndex.under('')]).toEqual([key]);
    store.delete(key);
    expect(store.pathIndex.under('').size).toBe(0);
    store.set(key, value);
    store.clear();
    expect(store.pathIndex.under('').size).toBe(0);
    store.set(key, value);
    expect([...store.pathIndex.under('/a~1b//leaf')]).toEqual([key]);
  });

  it('indexes rule source and target once at shared ancestors', () => {
    const key = JSON.stringify(['/list/0/source', 'string', 1, '/rule',
      'target', '/list/1/target', 'string', 2]);
    const store = new PathKeyedMap('rule', [[key, undefined]]);
    expect([...store.pathIndex.under('/list/0')]).toEqual([key]);
    expect([...store.pathIndex.under('/list/1')]).toEqual([key]);
    expect([...store.pathIndex.under('/list')]).toEqual([key]);
    store.delete(key);
    expect(store.pathIndex.under('/list').size).toBe(0);
    expect([...store.pathIndex.tail('/list', 0)]).toEqual([]);
  });

  it('finds numeric tails across digit boundaries and sparse slots', () => {
    const store = new PathKeyedMap<number>('path');
    for (const slot of ['0', '9', '10', '99', '100', '1000000000', '01', '-1',
      '9007199254740991', '9007199254740992'])
      store.set(`/list/${slot}/leaf`, 1);
    expect([...store.pathIndex.tail('/list', 10)].sort())
      .toEqual(['/list/10', '/list/100', '/list/1000000000',
        '/list/9007199254740991', '/list/99']);
    store.delete('/list/1000000000/leaf');
    expect([...store.pathIndex.tail('/list', 100)].sort())
      .toEqual(['/list/100', '/list/9007199254740991']);
    store.clear();
    expect([...store.pathIndex.tail('/list', 0)]).toEqual([]);
  });

  it('invalidates descendant and ancestor projections without sibling projections', () => {
    const store = new PathKeyedMap('path', [
      ['', 0], ['/list', 1], ['/list/1', 2], ['/list/1/key', 3], ['/list/0', 4], ['/other', 5],
    ]);
    expect([...store.pathIndex.intersecting('/list/1')].sort())
      .toEqual(['', '/list', '/list/1', '/list/1/key']);
  });

  it('maintains path sets across chained batch shifts and rollback', () => {
    const store = new PathKeyedSet(['/0/leaf', '/1/leaf', '/2/leaf']);
    store.replacePaths([{ previous: '/0/leaf' },
      { previous: '/1/leaf', current: '/0/leaf' },
      { previous: '/2/leaf', current: '/1/leaf' }]);
    expect([...store]).toEqual(['/0/leaf', '/1/leaf']);
    expect([...store.pathIndex.tail('', 1)]).toEqual(['/1']);
    store.delete('/0/leaf');
    store.add('/0/leaf');
    expect(store.pathIndex.under('').size).toBe(2);
    store.clear();
    store.add('/10/leaf');
    expect([...store.pathIndex.tail('', 2)]).toEqual(['/10']);
  });

  it('reuses affected prefixes across colliding Map shifts and removes the final tail', () => {
    const store = new PathKeyedMap('path', [['/list/0/key', 0],
      ['/list/1/key', 1], ['/list/2/key', 2], ['/other', 3]]);
    store.replaceEntries([
      { previous: '/list/0/key', value: 0, paths: [] },
      { previous: '/list/1/key', key: '/list/0/key', value: 1, paths: ['/list/0/key'] },
      { previous: '/list/2/key', key: '/list/1/key', value: 2, paths: ['/list/1/key'] },
    ]);
    expect([...store]).toEqual([['/other', 3], ['/list/0/key', 1], ['/list/1/key', 2]]);
    expect([...store.pathIndex.under('/list')].sort()).toEqual(['/list/0/key', '/list/1/key']);
    expect([...store.pathIndex.tail('/list', 2)]).toEqual([]);
    store.delete('/list/0/key');
    store.delete('/list/1/key');
    expect([...store.pathIndex.tail('/list', 0)]).toEqual([]);
    expect([...store.pathIndex.under('')]).toEqual(['/other']);
  });
});
