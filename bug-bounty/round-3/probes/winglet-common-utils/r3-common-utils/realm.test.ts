import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import {
  Murmur3,
  clone,
  cloneLite,
  createSafeFingerprint,
  equals,
  isPlainObject,
  merge,
} from '@/common-utils/index';

const foreign = <T>(source: string): T => runInNewContext(source) as T;

describe('clone of built-ins created in another realm', () => {
  it('a foreign Map clone is a working Map with the same entries', () => {
    const source = foreign<Map<string, number>>('new Map([["a", 1]])');
    const copy = clone(source);
    let read: unknown;
    try {
      read = copy.get('a');
    } catch (error) {
      read = (error as Error).message;
    }
    expect(read).toBe(1);
  });

  it('a foreign Set clone is a working Set', () => {
    const source = foreign<Set<number>>('new Set([1, 2])');
    const copy = clone(source);
    let size: unknown;
    try {
      size = copy.size;
    } catch (error) {
      size = (error as Error).message;
    }
    expect(size).toBe(2);
  });

  it('a foreign Date clone keeps its time', () => {
    const source = foreign<Date>('new Date(1700000000000)');
    const copy = clone(source);
    let time: unknown;
    try {
      time = copy.getTime();
    } catch (error) {
      time = (error as Error).message;
    }
    expect(time).toBe(1700000000000);
  });

  it('a foreign RegExp clone still matches', () => {
    const source = foreign<RegExp>('/ab+c/i');
    const copy = clone(source);
    let matched: unknown;
    try {
      matched = copy.test('ABBC');
    } catch (error) {
      matched = (error as Error).message;
    }
    expect(matched).toBe(true);
  });

  it('a plain object holding a foreign Map clones into a usable structure', () => {
    const source = { meta: foreign<Map<string, number>>('new Map([["v", 2]])') };
    const copy = clone(source);
    let read: unknown;
    try {
      read = copy.meta.get('v');
    } catch (error) {
      read = (error as Error).message;
    }
    expect(read).toBe(2);
  });

  it('control: equals compares foreign Maps by content', () => {
    expect(
      equals(
        foreign<Map<string, number>>('new Map([["a", 1]])'),
        foreign<Map<string, number>>('new Map([["a", 2]])'),
      ),
    ).toBe(false);
  });

  it('control: cloneLite on a foreign Map', () => {
    const source = foreign<Map<string, number>>('new Map([["a", 1]])');
    const copy = cloneLite(source) as Map<string, number>;
    let read: unknown;
    try {
      read = copy.get('a');
    } catch (error) {
      read = (error as Error).message;
    }
    expect(read).toBe(1);
  });
});

describe('Murmur3 bytes created in another realm', () => {
  it('a foreign Uint8Array hashes like a local one', () => {
    const local = new Uint8Array([1, 2, 3, 4, 5]);
    const other = foreign<Uint8Array>('new Uint8Array([1, 2, 3, 4, 5])');
    let hashed: unknown;
    try {
      hashed = Murmur3.hash(other);
    } catch (error) {
      hashed = (error as Error).message;
    }
    expect(hashed).toBe(Murmur3.hash(local));
  });

  it('a foreign ArrayBuffer hashes like a local one', () => {
    const local = new Uint8Array([9, 8, 7]).buffer;
    const other = foreign<ArrayBuffer>('new Uint8Array([9, 8, 7]).buffer');
    let hashed: unknown;
    try {
      hashed = Murmur3.hash(other);
    } catch (error) {
      hashed = (error as Error).message;
    }
    expect(hashed).toBe(Murmur3.hash(local));
  });
});

describe('createSafeFingerprint of plain data from another realm', () => {
  it('a foreign plain object is fingerprinted by content like a local one', () => {
    const other = foreign<Record<string, unknown>>('({ a: 1, b: [1, 2] })');
    expect(isPlainObject(other)).toBe(true);
    expect(createSafeFingerprint(other)).toBe(
      createSafeFingerprint({ a: 1, b: [1, 2] }),
    );
  });

  it('a foreign Date is fingerprinted by value', () => {
    const other = foreign<Date>('new Date(5)');
    expect(createSafeFingerprint(other)).toBe(createSafeFingerprint(new Date(5)));
  });
});

describe('merge of plain data from another realm', () => {
  it('merges a foreign plain source into a local target deeply', () => {
    const target = { a: { x: 1 } };
    const source = foreign<Record<string, unknown>>('({ a: { y: 2 } })');
    const result = merge(target, source as any) as any;
    expect(result.a).toEqual({ x: 1, y: 2 });
  });
});

describe('controls: other object utilities on foreign values', () => {
  it('stableEquals tells foreign Maps and Dates apart by content', async () => {
    const { stableEquals } = await import('@/common-utils/index');
    expect(
      stableEquals(
        foreign<Map<string, number>>('new Map([["a", 1]])'),
        foreign<Map<string, number>>('new Map([["a", 2]])'),
      ),
    ).toBe(false);
    expect(
      stableEquals(foreign<Date>('new Date(1)'), foreign<Date>('new Date(2)')),
    ).toBe(false);
  });

  it('cloneLite keeps a foreign Date and Set usable', () => {
    const date = cloneLite(foreign<Date>('new Date(7)')) as Date;
    const set = cloneLite(foreign<Set<number>>('new Set([1])')) as Set<number>;
    expect([date.getTime(), set.has(1)]).toEqual([7, true]);
  });

  it('stringifyGraph on a foreign plain object either encodes it or throws TypeError', async () => {
    const { stringifyGraph, parseGraph } = await import('@/common-utils/index');
    const other = foreign<Record<string, unknown>>('({ a: 1 })');
    let outcome: unknown;
    try {
      outcome = parseGraph(stringifyGraph(other));
    } catch (error) {
      outcome = (error as Error).name;
    }
    expect(outcome === 'TypeError' || JSON.stringify(outcome) === '{"a":1}').toBe(true);
  });
});

describe('clone of foreign binary data', () => {
  it('a foreign ArrayBuffer clone keeps its bytes', () => {
    const source = foreign<ArrayBuffer>('new Uint8Array([1, 2, 3]).buffer');
    const copy = clone(source);
    let bytes: unknown;
    try {
      bytes = Array.from(new Uint8Array(copy));
    } catch (error) {
      bytes = (error as Error).message;
    }
    expect(bytes).toEqual([1, 2, 3]);
  });

  it('control: a foreign Uint8Array clone keeps its bytes', () => {
    const source = foreign<Uint8Array>('new Uint8Array([4, 5])');
    expect(Array.from(clone(source))).toEqual([4, 5]);
  });
});
