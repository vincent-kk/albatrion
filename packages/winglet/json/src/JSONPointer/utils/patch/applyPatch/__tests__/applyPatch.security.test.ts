import { afterEach, describe, expect, it } from 'vitest';

import { Operation, type Patch } from '../../type';
import { applyPatch } from '../applyPatch';

/**
 * applyPatch 의 프로토타입 보호와 copy 값 격리에 대한 인시던트 스위트.
 * 일반 동작은 applyPatch.test.ts 담당 — 그 파일은 이미 test-record 상한을 넘겨 분할했다.
 */
describe('applyPatch security', () => {
  const prototype = Object.prototype as Record<string, unknown>;

  afterEach(() => {
    delete prototype.pollutedByApplyPatch;
  });

  it('copy 의 from 경로로 프로토타입을 참조할 수 없어야 한다', () => {
    const patches: Patch[] = [
      { op: Operation.COPY, from: '/__proto__', path: '/alias' },
    ];

    expect(() => applyPatch({}, patches)).toThrow();
  });

  it('copy 로 만든 별칭을 통한 프로토타입 오염이 차단되어야 한다', () => {
    const patches: Patch[] = [
      { op: Operation.COPY, from: '/__proto__', path: '/alias' },
      { op: Operation.ADD, path: '/alias/pollutedByApplyPatch', value: 'yes' },
    ];

    expect(() => applyPatch({}, patches)).toThrow();

    expect(prototype.pollutedByApplyPatch).toBeUndefined();
    expect(
      ({} as Record<string, unknown>).pollutedByApplyPatch,
    ).toBeUndefined();
  });

  it('move 의 from 경로도 동일하게 막아야 한다', () => {
    const patches: Patch[] = [
      { op: Operation.MOVE, from: '/__proto__', path: '/alias' },
    ];

    expect(() => applyPatch({}, patches)).toThrow();
  });

  it('copy 는 원본과 메모리를 공유하지 않는 값을 만들어야 한다', () => {
    const result = applyPatch<{ a: { n: number }; b: { n: number } }>(
      { a: { n: 1 } },
      [{ op: Operation.COPY, from: '/a', path: '/b' }],
    );

    result.b.n = 999;

    expect(result.a.n).toBe(1);
  });

  it('일반 경로의 copy 와 move 는 계속 동작해야 한다', () => {
    const copied = applyPatch<{ a: number; b: number }>({ a: 1 }, [
      { op: Operation.COPY, from: '/a', path: '/b' },
    ]);
    expect(copied).toEqual({ a: 1, b: 1 });

    const moved = applyPatch<{ b: number }>({ a: 1 }, [
      { op: Operation.MOVE, from: '/a', path: '/b' },
    ]);
    expect(moved.b).toBe(1);
  });
});
