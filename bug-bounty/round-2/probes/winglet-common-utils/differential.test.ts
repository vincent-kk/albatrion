import _ from 'lodash';
import { describe, expect, it } from 'vitest';

import {
  Murmur3,
  at,
  chunk,
  difference,
  groupBy,
  hasUndefined,
  unique,
  uniqueBy,
} from '@/common-utils/index';

const makeRandom = (start: number) => {
  let seed = start;
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
};

const referenceMurmur = (bytes: Uint8Array, seed = 0) => {
  let h = seed >>> 0;
  const n = bytes.length;
  const blocks = n - (n % 4);
  for (let i = 0; i < blocks; i += 4) {
    let k = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  let k = 0;
  const rest = n & 3;
  if (rest >= 3) k ^= bytes[blocks + 2] << 16;
  if (rest >= 2) k ^= bytes[blocks + 1] << 8;
  if (rest >= 1) {
    k ^= bytes[blocks];
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
  }
  h ^= n;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

describe('differential checks', () => {
  it('Murmur3 bytes match the reference for random lengths, offsets and split points', () => {
    const random = makeRandom(3);
    const mismatches: string[] = [];
    for (let trial = 0; trial < 1500; trial++) {
      const length = Math.floor(random() * 120);
      const offset = Math.floor(random() * 5);
      const buffer = new Uint8Array(length + offset + 4);
      for (let i = 0; i < buffer.length; i++) buffer[i] = Math.floor(random() * 256);
      const view = buffer.subarray(offset, offset + length);
      const seed = Math.floor(random() * 2 ** 32);
      const expected = referenceMurmur(view, seed);
      const parts: number[] = [];
      let cursor = 0;
      while (cursor < length) {
        const step = 1 + Math.floor(random() * 40);
        parts.push(Math.min(length, cursor + step));
        cursor += step;
      }
      const hasher = new Murmur3(undefined, seed);
      let start = 0;
      for (const end of parts) {
        hasher.hash(view.subarray(start, end));
        start = end;
      }
      const oneShot = Murmur3.hash(view, seed);
      if (oneShot !== expected || hasher.result() !== expected)
        mismatches.push(`len ${length} off ${offset}: ${oneShot}/${hasher.result()} vs ${expected}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  it('array helpers agree with lodash where semantics match', () => {
    const random = makeRandom(11);
    const pool = [0, -0, NaN, 1, '1', null, undefined, 'a', 2, 3];
    const pick = () => pool[Math.floor(random() * pool.length)];
    const failures: string[] = [];
    for (let trial = 0; trial < 2000; trial++) {
      const a = Array.from({ length: Math.floor(random() * 12) }, pick);
      const b = Array.from({ length: Math.floor(random() * 12) }, pick);
      if (!_.isEqual(difference(a, b), _.difference(a, b))) failures.push('difference');
      if (!_.isEqual(unique(a), _.uniq(a))) failures.push('unique');
      if (!_.isEqual(uniqueBy(a, (x) => typeof x), _.uniqBy(a, (x) => typeof x))) failures.push('uniqueBy');
      const size = 1 + Math.floor(random() * 5);
      if (!_.isEqual(chunk(a, size), _.chunk(a, size))) failures.push('chunk');
      const index = Math.floor(random() * 30) - 15;
      if (!Object.is(at(a, index), _.nth(a, index))) failures.push(`at ${index}`);
      const grouped = groupBy(a, (x) => String(x));
      if (!_.isEqual({ ...grouped }, _.groupBy(a, (x) => String(x)))) failures.push('groupBy');
    }
    expect([...new Set(failures)]).toEqual([]);
  });

  it('hasUndefined handles 100,000-deep nesting without overflow', () => {
    let deep: any = { leaf: undefined };
    for (let i = 0; i < 100_000; i++) deep = { child: deep };
    expect(hasUndefined(deep)).toBe(true);
  });
});
