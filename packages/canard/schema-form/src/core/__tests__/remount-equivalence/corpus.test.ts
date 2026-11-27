import { beforeEach, expect, it } from 'vitest';

import { createOmitEmptyDifferences } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOmitEmptyDifferences';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { generateCorpus } from '@/schema-form/__tests__/fixtures/remountEquivalence/generateCorpus';

import { checkCoreScene } from './helpers/checkCoreScene';

for (const family of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
  it(`family ${family} matches fresh mounts after every public write`, async ({
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
    // Family 14 differs only by the omitEmpty row of the VALUE-031 table, at prefix 1 where the condition enables omitEmpty.
    expect(mismatches).toStrictEqual(
      family === 14
        ? scenes.map((scene) => ({
            scene: scene.id,
            seed: 443,
            prefix: 1,
            differences: createOmitEmptyDifferences('~1source~1data'),
          }))
        : [],
    );
  }, 120000);
}

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
