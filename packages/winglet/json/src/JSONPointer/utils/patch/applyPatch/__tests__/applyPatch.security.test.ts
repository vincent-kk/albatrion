import { afterEach, describe, expect, it } from 'vitest';

import { Operation, type Patch } from '../../../patchModel';
import { applyPatch } from '../applyPatch';
import type { ApplyPatchOptions } from '../type';

/**
 * applyPatch 의 예약 멤버 own 데이터 취급(무오염 불변식)과 copy 값 격리에 대한
 * 인시던트 스위트. 예약 멤버 이름은 불투명한 문자열로 취급된다 — own 데이터만
 * 읽고 쓰며, 어떤 입력에서도 프로토타입 체인에 도달하지 않아야 한다.
 * 일반 동작은 applyPatch.test.ts 담당 — 그 파일은 이미 test-record 상한을 넘겨 분할했다.
 */
describe('applyPatch security', () => {
  const prototype = Object.prototype as Record<string, unknown>;

  afterEach(() => {
    delete prototype.pollutedByApplyPatch;
    delete prototype.x;
  });

  it('copy 의 from 이 own 아닌 예약 멤버면 프로토타입이 아니라 존재하지 않는 위치로 해석되어야 한다', () => {
    const patches: Patch[] = [
      { op: Operation.COPY, from: '/__proto__', path: '/alias' },
    ];

    const result = applyPatch<Record<string, unknown>>({}, patches);

    expect(result.alias).toBeUndefined();
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('copy 의 from 이 own 예약 멤버 데이터면 그 데이터가 복사되어야 한다', () => {
    const result = applyPatch<Record<string, unknown>>(
      JSON.parse('{"__proto__":{"d":1}}'),
      [{ op: Operation.COPY, from: '/__proto__', path: '/alias' }],
    );

    expect(result.alias).toEqual({ d: 1 });
    expect(result.alias).not.toBe(Object.prototype);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('own 아닌 예약 멤버 별칭을 경유한 쓰기는 누락 경로 실패이고 프로토타입은 오염되지 않아야 한다', () => {
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

  it('move 의 from 도 own 아닌 예약 멤버면 존재하지 않는 위치로 해석되어야 한다', () => {
    const patches: Patch[] = [
      { op: Operation.MOVE, from: '/__proto__', path: '/alias' },
    ];

    const result = applyPatch<Record<string, unknown>>({}, patches);

    expect(result.alias).toBeUndefined();
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
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

  it('RC-6: own 컨테이너가 있는 예약 멤버 경로 패치는 own 데이터로 적용되어야 한다', () => {
    const result = applyPatch<Record<string, unknown>>(
      JSON.parse('{"__proto__":{},"keep":1}'),
      [{ op: Operation.ADD, path: '/__proto__/x', value: 'v' }],
    );

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toEqual(
      { x: 'v' },
    );
    expect(result.keep).toBe(1);
    expect((result as { x?: unknown }).x).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('RC-6: own 컨테이너가 없는 예약 멤버 중간 경로는 일반 누락 경로와 동일하게 실패해야 한다', () => {
    let code: string | undefined;
    try {
      applyPatch({ keep: 1 }, [
        { op: Operation.ADD, path: '/__proto__/x', value: 'v' },
      ]);
    } catch (error) {
      code = (error as { code?: string }).code;
    }

    expect(code).toBe('JSON_PATCH.PATCH_PATH_INVALID_INTERMEDIATE');
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });

  it('RC-6: 어떤 옵션 값에서도 상속 객체가 변경되지 않아야 한다 (legacy protectPrototype 포함)', () => {
    const legacyOptions: ApplyPatchOptions & { protectPrototype: boolean } = {
      protectPrototype: false,
    };
    let code: string | undefined;
    try {
      applyPatch(
        { keep: 1 },
        [{ op: Operation.ADD, path: '/__proto__/x', value: 'v' }],
        legacyOptions,
      );
    } catch (error) {
      code = (error as { code?: string }).code;
    }

    expect(code).toBe('JSON_PATCH.PATCH_PATH_INVALID_INTERMEDIATE');
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });
});
