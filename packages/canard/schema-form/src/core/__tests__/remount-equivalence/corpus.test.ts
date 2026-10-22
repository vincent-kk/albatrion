import { beforeEach, expect, it } from 'vitest';

import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { generateCorpus } from '@/schema-form/__tests__/fixtures/remountEquivalence/generateCorpus';

import { checkCoreScene } from './helpers/checkCoreScene';

for (const family of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
  // D443-02(14) — 결함, 수정 PR 대기; C443-01(14) — VALUE-031 ㄴ 후보, 소유자 판정 대기.
  const test = family === 14 ? it.fails : it;
  test(`family ${family} matches fresh mounts after every public write`, async ({
    task,
  }) => {
    const count = task.file.projectName?.startsWith('verify-') ? 1024 : 128;
    const scenes = generateCorpus(443, count).filter(
      (scene) => scene.group === `family-${family}`,
    );
    const mismatches = [];
    for (const scene of scenes)
      mismatches.push(...(await checkCoreScene(scene, false)));
    Object.assign(task.meta, {
      remount: encodeValue(mismatches),
      corpus: {
        family,
        count: scenes.length,
        prefixes: scenes.reduce(
          (total, scene) => total + scene.writes.length + 1,
          0,
        ),
      },
    });
    console.log(
      'REMOUNT_CORPUS_COUNT',
      JSON.stringify({
        family,
        count: scenes.length,
        prefixes: scenes.reduce(
          (total, scene) => total + scene.writes.length + 1,
          0,
        ),
        project: task.file.projectName,
      }),
    );
    expect(mismatches).toEqual([]);
  }, 120000);
}

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
