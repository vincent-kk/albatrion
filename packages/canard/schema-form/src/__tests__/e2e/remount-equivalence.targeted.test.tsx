import { type TestContext, beforeEach, expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOmitEmptyDifferences } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOmitEmptyDifferences';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { overlayDifferencePaths } from '@/schema-form/__tests__/fixtures/remountEquivalence/overlayDifferencePaths';
import type {
  RemountMismatch,
  RemountScene,
} from '@/schema-form/__tests__/fixtures/remountEquivalence/types';

import { checkRenderScene } from './remount-equivalence/helpers/checkRenderScene';

const [emptyScene, trailingScene, typeScene, controlScene] =
  createOverlayScenes();

/**
 * Replay scenes through the screen and keep mismatches and ignored writes in the task metadata.
 * @param scenes - Scenes replayed in order on separate forms.
 * @param task - The running test, whose metadata receives the diagnosis.
 * @returns Every mismatch of the scenes, in scene and prefix order.
 */
async function replayRenderScenes(
  scenes: readonly RemountScene[],
  task: TestContext['task'],
) {
  const mismatches: RemountMismatch[] = [];
  const ignored = [];
  for (const scene of scenes) {
    const result = await checkRenderScene(scene);
    mismatches.push(...result.mismatches);
    if (result.ignored.length)
      ignored.push({ scene: scene.id, prefixes: result.ignored });
  }
  Object.assign(task.meta, { remount: encodeValue(mismatches), ignored });
  return mismatches;
}

for (const [group, scenes] of [
  ['star', createStarScenes()],
  ['relocated', createRelocatedScenes()],
  ['ancestor', createAncestorScenes()],
] as const)
  it(`replays ${group} gap scenes through DOM and FormHandle`, async ({
    task,
  }) => {
    expect(await replayRenderScenes(scenes, task)).toEqual([]);
  }, 120000);

// Each overlay scene asserts its exact difference paths from one VALUE-031 table row; any other difference fails.
// The trailing row also reaches the DOM, and the union row outside observers, FormHandle and the DOM.
it('replays the omitEmpty overlay scene through DOM and FormHandle', async ({
  task,
}) => {
  expect(await replayRenderScenes([emptyScene], task)).toStrictEqual([
    {
      scene: 'gap-overlay-empty',
      seed: 443,
      prefix: 1,
      differences: createOmitEmptyDifferences('~1source~1data'),
    },
  ]);
}, 120000);

it('replays the omitTrailingEmpty overlay scene through DOM and FormHandle', async ({
  task,
}) => {
  const mismatches = await replayRenderScenes([trailingScene], task);
  const { node, screen } = overlayDifferencePaths['gap-overlay-trailing'];
  expect(
    mismatches.map(({ scene, prefix, differences }) => [
      scene,
      prefix,
      differences.map(({ path }) => path),
    ]),
  ).toStrictEqual([['gap-overlay-trailing', 1, [...node, ...screen]]]);
}, 120000);

// VALUE-031 table, union row: pins the current unconverted reading of a gate-narrowed union.
it('replays the union type overlay scene through DOM and FormHandle', async ({
  task,
}) => {
  const mismatches = await replayRenderScenes([typeScene], task);
  const { node, screen } = overlayDifferencePaths['gap-overlay-type'];
  expect(
    mismatches.map(({ scene, prefix, differences }) => [
      scene,
      prefix,
      differences.map(({ path }) => path),
    ]),
  ).toStrictEqual([['gap-overlay-type', 1, [...node, ...screen]]]);
}, 120000);

it('replays the same-host omitEmpty control through DOM and FormHandle', async ({
  task,
}) => {
  expect(await replayRenderScenes([controlScene], task)).toStrictEqual([
    {
      scene: 'control-overlay-same-host',
      seed: 443,
      prefix: 1,
      differences: createOmitEmptyDifferences('~1cfg'),
    },
  ]);
}, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
