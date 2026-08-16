import { describe, expect, it } from 'vitest';

import { mergePatch } from '../mergePatch';

/**
 * immutable 모드는 반환값이 입력과 메모리를 공유하지 않을 것을 약속한다.
 */
describe('mergePatch immutability', () => {
  it('should clone a non-object patch that fully replaces the source', () => {
    const patch = [1, 2];

    const result = mergePatch({ a: 1 }, patch, true);

    expect(result).toEqual([1, 2]);
    expect(result).not.toBe(patch);
  });

  it('should hand back the patch itself when immutability is waived', () => {
    const patch = [1, 2];

    expect(mergePatch({ a: 1 }, patch, false)).toBe(patch);
  });
});
