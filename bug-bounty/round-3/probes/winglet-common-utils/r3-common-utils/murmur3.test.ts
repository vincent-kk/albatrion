import { describe, expect, it } from 'vitest';

import { Murmur3 } from '@/common-utils/index';

/** Seeded linear congruential generator, so failures replay. */
const createRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

/** Straightforward MurmurHash3 x86_32 over bytes, used as the reference. */
const referenceHash = (bytes: Uint8Array, seed: number): number => {
  let h1 = seed >>> 0;
  const blocks = bytes.length - (bytes.length % 4);
  const mixK = (k: number) => {
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    return Math.imul(k, 0x1b873593);
  };
  for (let i = 0; i < blocks; i += 4) {
    const k =
      bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
    h1 ^= mixK(k);
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }
  let k1 = 0;
  const tail = bytes.length & 3;
  if (tail === 3) k1 ^= bytes[blocks + 2] << 16;
  if (tail >= 2) k1 ^= bytes[blocks + 1] << 8;
  if (tail >= 1) {
    k1 ^= bytes[blocks];
    h1 ^= mixK(k1);
  }
  h1 ^= bytes.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
};

describe('Murmur3 incremental against one-shot (bytes)', () => {
  it('random splits, random byte offsets and seeds match the reference', () => {
    const random = createRandom(20261118);
    const mismatches: string[] = [];
    for (let trial = 0; trial < 3000; trial++) {
      const length = Math.floor(random() * 200);
      const offset = Math.floor(random() * 8);
      const backing = new Uint8Array(length + offset + 8);
      for (let i = 0; i < backing.length; i++)
        backing[i] = Math.floor(random() * 256);
      const bytes = backing.subarray(offset, offset + length);
      const seed = Math.floor(random() * 0x100000000);
      const expected = referenceHash(bytes, seed);
      const hasher = new Murmur3(undefined, seed);
      let position = 0;
      while (position < length) {
        const step = 1 + Math.floor(random() * 70);
        const piece = bytes.subarray(position, Math.min(length, position + step));
        if (random() < 0.3) hasher.hash(piece.slice().buffer);
        else hasher.hash(piece);
        if (random() < 0.2) hasher.result();
        position += step;
      }
      const actual = hasher.result();
      if (actual !== expected)
        mismatches.push(`length=${length} offset=${offset} seed=${seed}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });
});

describe('Murmur3 incremental against one-shot (strings)', () => {
  it('random strings with surrogates and wide code units split anywhere match the one-shot hash', () => {
    const random = createRandom(7);
    const alphabet = ['a', 'Z', 'ÿ', 'Ā', '가', '😀', '￿', '耀', '\0'];
    const mismatches: string[] = [];
    for (let trial = 0; trial < 3000; trial++) {
      let text = '';
      const count = Math.floor(random() * 40);
      for (let i = 0; i < count; i++)
        text += alphabet[Math.floor(random() * alphabet.length)];
      const seed = Math.floor(random() * 0x100000000);
      const expected = Murmur3.hash(text, seed);
      const hasher = new Murmur3(undefined, seed);
      let position = 0;
      while (position < text.length) {
        const step = 1 + Math.floor(random() * 9);
        hasher.hash(text.slice(position, position + step));
        position += step;
      }
      if (hasher.result() !== expected)
        mismatches.push(JSON.stringify(text) + ' seed=' + seed);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  it('constructor seeding equals reset seeding', () => {
    expect(new Murmur3('abcdef', 99).result()).toBe(
      new Murmur3().reset(99).hash('abcdef').result(),
    );
  });
});
