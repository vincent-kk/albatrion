import { beforeEach, expect, it } from 'vitest';

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
  expect(mismatches).toEqual([]);
}, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
