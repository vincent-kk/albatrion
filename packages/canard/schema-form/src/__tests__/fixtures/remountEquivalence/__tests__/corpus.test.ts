import { beforeEach, expect, it } from 'vitest';

import { requiredFeatures, requiredPairs } from '../coverageRequirements';
import { encodeValue } from '../encodeValue';
import { generateCorpus } from '../generateCorpus';
import { inspectSceneFeatures } from '../inspectSceneFeatures';
import { selectRenderScenes } from '../selectRenderScenes';

it('replays the fixed seed and preserves the default corpus inside verify', () => {
  const small = generateCorpus(443, 128);
  const large = generateCorpus(443, 1024);
  expect(small).toHaveLength(128);
  expect(large).toHaveLength(1024);
  expect(encodeValue(small)).toEqual(encodeValue(generateCorpus(443, 128)));
  for (const scene of small)
    expect(encodeValue(large.find(({ id }) => id === scene.id))).toEqual(
      encodeValue(scene),
    );
  expect(small[0].schema).not.toBe(generateCorpus(443, 128)[0].schema);
});

it('covers the declared schema dimensions, public writes and independent pairs', () => {
  const scenes = generateCorpus(443, 1024);
  const coverage = scenes.map(inspectSceneFeatures);
  expect(
    requiredFeatures.filter(
      (feature) => !coverage.some((features) => features.includes(feature)),
    ),
  ).toEqual([]);
  expect(
    requiredPairs.filter(
      ([a, b]) =>
        !coverage.some(
          (features) => features.includes(a) && features.includes(b),
        ),
    ),
  ).toEqual([]);
});

it('selects a deterministic screen sample that retains every required pair', () => {
  const scenes = generateCorpus(443, 128);
  const selected = selectRenderScenes(scenes);
  expect(selected.map(({ id }) => id)).toEqual(
    selectRenderScenes(scenes).map(({ id }) => id),
  );
  expect(selected.length).toBeLessThan(scenes.length);
  const coverage = selected.map(inspectSceneFeatures);
  expect(
    requiredPairs.filter(
      ([a, b]) =>
        !coverage.some(
          (features) => features.includes(a) && features.includes(b),
        ),
    ),
  ).toEqual([]);
});

it('does not directly write automatic targets and predicts zero generic masks', () => {
  for (const scene of generateCorpus(443, 1024)) {
    if (scene.group === 'family-13' || scene.group === 'family-15') {
      const forbidden =
        scene.group === 'family-13' ? ['/target'] : ['/target', '/cleared'];
      expect(
        scene.writes.filter((write) => forbidden.includes(write.path ?? '')),
      ).toEqual([]);
      for (const write of scene.writes.filter(
        (entry) => entry.action === 'bulk',
      ))
        expect(
          Object.keys(write.value as object).filter((key) =>
            forbidden.includes(`/${key}`),
          ),
        ).toEqual([]);
    }
    expect(scene.masks ?? []).toEqual([]);
  }
});

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
