import { describe, expect, it } from 'vitest';

import { stableSerialize } from '../stableSerialize';

/**
 * 순회 도중 예외가 나면 자리표시자가 캐시에 남아, 이후 모든 호출이 실제 지문 대신
 * 순환 참조 마커를 돌려주게 된다.
 */
describe('stableSerialize after a failed walk', () => {
  it('should not leave the placeholder cached when a getter throws', () => {
    let failing = true;
    const input = {
      a: 1,
      get b() {
        if (failing) throw new Error('getter failed');
        return 2;
      },
    };

    expect(() => stableSerialize(input)).toThrow('getter failed');

    failing = false;
    expect(stableSerialize(input)).toBe(stableSerialize({ a: 1, b: 2 }));
  });
});
