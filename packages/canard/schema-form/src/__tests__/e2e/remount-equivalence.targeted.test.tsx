import { beforeEach, expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';

import { checkRenderScene } from './remount-equivalence/helpers/checkRenderScene';

for (const [group, scenes, test] of [
  ['star', createStarScenes(), it],
  // D443-04 — 원장 판정 대기; D443-05 — U7 후보, 소유자 판정 대기; C443-01·C443-02 — VALUE-031 ㄴ 후보, 소유자 판정 대기.
  ['overlay', createOverlayScenes(), it.fails],
  // D443-03 — 결함, 수정 PR 대기.
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
