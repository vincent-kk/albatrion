import { beforeEach, expect, it } from 'vitest';

import { createOmitEmptyDifferences } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOmitEmptyDifferences';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { generateCorpus } from '@/schema-form/__tests__/fixtures/remountEquivalence/generateCorpus';
import { selectRenderScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/selectRenderScenes';

import { checkRenderScene } from './remount-equivalence/helpers/checkRenderScene';

it('replays a deterministic feature-pair cover through the screen adapter', async ({
  task,
}) => {
  const count = task.file.projectName?.startsWith('verify-') ? 1024 : 128;
  const scenes = selectRenderScenes(generateCorpus(443, count));
  const mismatches = [];
  const ignored = [];
  for (const scene of scenes) {
    const result = await checkRenderScene(scene);
    mismatches.push(...result.mismatches);
    if (result.ignored.length)
      ignored.push({ scene: scene.id, prefixes: result.ignored });
  }
  Object.assign(task.meta, {
    remount: encodeValue(mismatches),
    ignored,
    corpus: {
      count: scenes.length,
      prefixes: scenes.reduce(
        (total, scene) => total + scene.writes.length + 1,
        0,
      ),
      selected: scenes.map(({ id }) => id),
    },
  });
  // Family 14 scenes differ only by the omitEmpty row of the VALUE-031 round-trip table in settle/DETAIL.md; FormHandle and DOM match.
  expect(mismatches).toStrictEqual(
    scenes
      .filter((scene) => scene.group === 'family-14')
      .map((scene) => ({
        scene: scene.id,
        seed: 443,
        prefix: 1,
        differences: createOmitEmptyDifferences('~1source~1data'),
      })),
  );
}, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
