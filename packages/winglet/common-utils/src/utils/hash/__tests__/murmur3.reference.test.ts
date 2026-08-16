import { describe, expect, it } from 'vitest';

import { Murmur3 } from '../murmur3';

/**
 * Austin Appleby 의 MurmurHash3 x86_32 레퍼런스와의 일치를 고정한다.
 * murmur3.test.ts 는 구현이 스스로 내놓은 값을 기대값으로 삼고 있어 알고리즘 오류를
 * 잡지 못했다 — 이 파일의 기대값은 전부 레퍼런스에서 독립적으로 도출했다.
 */
describe('Murmur3 reference vectors', () => {
  /** 바이트 값이 재현 가능한 테스트 입력. */
  const createBytes = (length: number): Uint8Array =>
    Uint8Array.from({ length }, (_, index) => (index * 7 + 3) & 0xff);

  it('should match the published string vectors for seed 0', () => {
    expect(Murmur3.hash('')).toBe(0);
    expect(Murmur3.hash('a')).toBe(1009084850);
    expect(Murmur3.hash('abc')).toBe(3017643002);
    expect(Murmur3.hash('abcd')).toBe(1139631978);
    expect(Murmur3.hash('hello')).toBe(613153351);
  });

  it('should match the reference for byte inputs shorter than the DataView path', () => {
    expect(Murmur3.hash(createBytes(0))).toBe(0);
    expect(Murmur3.hash(createBytes(1))).toBe(1579843702);
    expect(Murmur3.hash(createBytes(3))).toBe(3328613650);
    expect(Murmur3.hash(createBytes(4))).toBe(2399179545);
    expect(Murmur3.hash(createBytes(7))).toBe(545649965);
    expect(Murmur3.hash(createBytes(8))).toBe(4109149985);
    expect(Murmur3.hash(createBytes(16))).toBe(2213931330);
  });

  it('should match the reference where the unrolled DataView loop leaves a remainder', () => {
    // 32 와 64 는 8청크 배수라 우연히 통과하던 길이, 36·40·48·100 이 문제 구간이다
    expect(Murmur3.hash(createBytes(32))).toBe(1702566899);
    expect(Murmur3.hash(createBytes(36))).toBe(4115963592);
    expect(Murmur3.hash(createBytes(40))).toBe(2260214525);
    expect(Murmur3.hash(createBytes(48))).toBe(3060091198);
    expect(Murmur3.hash(createBytes(64))).toBe(2651785145);
    expect(Murmur3.hash(createBytes(100))).toBe(599798486);
  });

  it('should hash the same bytes alike whether or not the view is aligned', () => {
    for (const length of [36, 40, 48, 100]) {
      const source = createBytes(length);
      const padded = new Uint8Array(length + 1);
      padded.set(source, 1);
      const unaligned = padded.subarray(1);

      expect(Murmur3.hash(unaligned)).toBe(Murmur3.hash(source));
    }
  });

  it('should not drop a trailing block whose high bit is set', () => {
    // 3번째 꼬리 문자가 0x8000 이상이면 k1 이 음수 int32 가 된다
    expect(Murmur3.hash('AAAAab耀')).not.toBe(Murmur3.hash('AAAAab老'));
  });

  it('should honour the seed', () => {
    expect(Murmur3.hash('hello', 42)).toBe(3806057185);
    expect(Murmur3.hash('hello', 42)).not.toBe(Murmur3.hash('hello'));
  });
});
