import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { Murmur3 } from '../murmur3';

it('round-3 hashes foreign bytes identically for constructor, static and incremental APIs', () => {
  const bytes = new Uint8Array([1,2,3,4,5]);
  const foreign: Uint8Array = runInNewContext('new Uint8Array([1,2,3,4,5])');
  const buffer: ArrayBuffer = runInNewContext('new Uint8Array([1,2,3,4,5]).buffer');
  for (const value of [foreign,buffer]) {
    expect(Murmur3.hash(value)).toBe(Murmur3.hash(bytes));
    expect(new Murmur3(value).result()).toBe(new Murmur3(bytes).result());
    expect(new Murmur3().hash(value).result()).toBe(Murmur3.hash(bytes));
  }
});
