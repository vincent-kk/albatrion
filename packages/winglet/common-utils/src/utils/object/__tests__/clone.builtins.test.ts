import { describe, expect, it } from 'vitest';

import { clone } from '../clone';

/**
 * 내장 타입 복제의 충실도 — 메모리 격리와 참조 동일성 보존.
 * 일반 동작은 clone.test.ts 담당(이미 test-record 상한에 근접해 분할).
 */
describe('clone built-in types', () => {
  it('should not share memory with the original Buffer', () => {
    const source = Buffer.from([1, 2, 3]);

    const cloned = clone(source);
    cloned[0] = 99;

    expect(source[0]).toBe(1);
    expect(Buffer.isBuffer(cloned)).toBe(true);
  });

  it('should keep a shared Date reference shared in the clone', () => {
    const shared = new Date('2024-01-01T00:00:00.000Z');

    const cloned = clone({ a: shared, b: shared });

    expect(cloned.a).not.toBe(shared);
    expect(cloned.a).toBe(cloned.b);
    expect(cloned.a.getTime()).toBe(shared.getTime());
  });

  it('should keep shared RegExp and TypedArray references shared in the clone', () => {
    const regex = /x/g;
    const bytes = new Uint8Array([1, 2]);

    const cloned = clone({ a: regex, b: regex, c: bytes, d: bytes });

    expect(cloned.a).not.toBe(regex);
    expect(cloned.a).toBe(cloned.b);
    expect(cloned.c).not.toBe(bytes);
    expect(cloned.c).toBe(cloned.d);
  });

  it('should preserve the groups of a RegExp match array', () => {
    const match = /(?<word>\w+)/.exec('hello');
    if (match === null) throw new Error('match is required for this case');

    const cloned = clone(match);

    expect(cloned.groups).toEqual({ word: 'hello' });
    expect(cloned.index).toBe(match.index);
    expect(cloned.input).toBe(match.input);
  });
});
