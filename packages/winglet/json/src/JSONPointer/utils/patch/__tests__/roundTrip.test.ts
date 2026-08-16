import { describe, expect, it } from 'vitest';

import { applyPatch } from '../applyPatch/applyPatch';
import { compare } from '../compare/compare';
import { difference } from '../difference/difference';
import { mergePatch } from '../mergePatch/mergePatch';

/**
 * compare 와 applyPatch, difference 와 mergePatch 는 서로의 역이어야 한다.
 * 각 함수의 단위 테스트만으로는 이 결합 계약이 검증되지 않아 배열 축소 결함이 살아남았다.
 */
describe('patch round trips', () => {
  const roundTripsThroughApplyPatch = (source: unknown, target: unknown) =>
    applyPatch(source as never, compare(source as never, target as never));

  it('should rebuild the target when an array loses several entries', () => {
    expect(roundTripsThroughApplyPatch([1, 2, 3, 4], [1])).toEqual([1]);
    expect(roundTripsThroughApplyPatch([1, 2, 3], [3])).toEqual([3]);
    expect(roundTripsThroughApplyPatch([1, 2, 3, 4, 5], [1, 3, 5])).toEqual([
      1, 3, 5,
    ]);
  });

  it('should rebuild the target when a nested array loses entries', () => {
    expect(roundTripsThroughApplyPatch({ a: [1, 2, 3] }, { a: [1] })).toEqual({
      a: [1],
    });
  });

  it('should rebuild the target for growth and replacement', () => {
    expect(roundTripsThroughApplyPatch([1], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(roundTripsThroughApplyPatch([1, 2], [3, 4])).toEqual([3, 4]);
    expect(
      roundTripsThroughApplyPatch({ a: 1, b: 2 }, { a: 1, c: 3 }),
    ).toEqual({ a: 1, c: 3 });
  });

  it('should rebuild the target through difference and mergePatch', () => {
    const source = { a: 1, nested: { b: 2, c: 3 } };
    const target = { a: 1, nested: { b: 9 } };

    expect(mergePatch(source, difference(source, target))).toEqual(target);
  });

  it('should merge a patch onto a target whose value is not an object', () => {
    expect(mergePatch({ a: 5 }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
    expect(mergePatch({ a: 'text' }, { a: { b: 1 } })).toEqual({
      a: { b: 1 },
    });
    expect(mergePatch({ a: null }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
    expect(mergePatch({ a: [1] }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });
});
