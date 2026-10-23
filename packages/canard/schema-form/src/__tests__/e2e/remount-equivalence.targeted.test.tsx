import { beforeEach, expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';

import { checkRenderScene } from './remount-equivalence/helpers/checkRenderScene';

for (const [group, scenes, test] of [
  ['star', createStarScenes(), it],
  // 정당한 차이로 닫힌 핀(architecture/reviews/round-444-closing.md): C443-01(444C-01)·C443-02(444C-02)·D443-04(444C-03)·D443-05(444C-04).
  ['overlay', createOverlayScenes(), it.fails],
  // D443-03 — 결함, 수정 PR #451 의 소유자 수용(TEST-027) 대기.
  ['relocated', createRelocatedScenes(), it.fails],
  ['ancestor', createAncestorScenes(), it],
] as const)
  test(`replays ${group} gap scenes through DOM and FormHandle`, async ({
    task,
  }) => {
    const mismatches = [];
    const ignored = [];
    for (const scene of scenes) {
      const result = await checkRenderScene(scene);
      mismatches.push(...result.mismatches);
      if (result.ignored.length)
        ignored.push({ scene: scene.id, prefixes: result.ignored });
    }
    Object.assign(task.meta, { remount: encodeValue(mismatches), ignored });
    expect(mismatches).toEqual([]);
  }, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
