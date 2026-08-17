import { bench, describe } from 'vitest';

import { Murmur3 } from '@/common-utils';

/**
 * Builds a byte buffer of the requested size, optionally offset inside a larger one so
 * the unaligned path is measured as well.
 *
 * @param size - Number of bytes to hash
 * @param offset - Byte offset the returned view starts at
 * @returns A view over `size` bytes
 */
const createBytes = (size: number, offset = 0): Uint8Array => {
  const buffer = new Uint8Array(size + offset);
  for (let index = 0; index < buffer.length; index++)
    buffer[index] = (index * 7 + 3) & 0xff;
  return buffer.subarray(offset);
};

const short = createBytes(16);
const medium = createBytes(1024);
const large = createBytes(64 * 1024);
const mediumUnaligned = createBytes(1024, 1);
const text = 'a'.repeat(1024);

describe('Murmur3 — byte inputs by size', () => {
  bench('16 B', () => {
    Murmur3.hash(short);
  });
  bench('1 KB', () => {
    Murmur3.hash(medium);
  });
  bench('64 KB', () => {
    Murmur3.hash(large);
  });
});

describe('Murmur3 — alignment and input kind', () => {
  bench('1 KB aligned', () => {
    Murmur3.hash(medium);
  });
  bench('1 KB unaligned', () => {
    Murmur3.hash(mediumUnaligned);
  });
  bench('1 KB string', () => {
    Murmur3.hash(text);
  });
});
