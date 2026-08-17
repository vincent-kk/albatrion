import { describe, expect, it } from 'vitest';

import { Operation, type Patch } from '../../../patchModel';
import { applyPatch } from '../applyPatch';
import { JsonPatchError } from '../utils/error';

/**
 * RFC 6901 은 포인터를 `/` 로 시작하는 형태와 URI fragment(`#/…`) 형태 둘 다로 쓴다.
 * `compileSegments` 가 이미 두 형태를 받으므로 패치 경로도 같은 집합을 받아야 한다.
 */
describe('applyPatch path forms', () => {
  it('should accept a URI fragment pointer', () => {
    const patches: Patch[] = [
      { op: Operation.REPLACE, path: '#/a/b', value: 2 },
    ];

    expect(applyPatch({ a: { b: 1 } }, patches)).toEqual({ a: { b: 2 } });
  });

  it('should reject a path that starts with neither separator nor fragment', () => {
    const patches: Patch[] = [{ op: Operation.REPLACE, path: 'a/b', value: 2 }];

    expect(() => applyPatch({ a: { b: 1 } }, patches)).toThrow();
  });

  it('should report a malformed from pointer as a patch error', () => {
    const patches = [
      { op: Operation.COPY, path: '/b' } as unknown as Patch,
      { op: Operation.MOVE, path: '/b', from: undefined } as unknown as Patch,
    ];

    // 구조화된 패치 오류여야 한다 — 내부에서 새는 TypeError 가 아니라
    expect(() => applyPatch({ a: 1 }, patches)).toThrow(JsonPatchError);
  });
});
