import { type TestContext, beforeEach, expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOmitEmptyDifferences } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOmitEmptyDifferences';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';
import { overlayDifferencePaths } from '@/schema-form/__tests__/fixtures/remountEquivalence/overlayDifferencePaths';
import type { RemountScene } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';

import { checkCoreScene } from './helpers/checkCoreScene';

const [emptyScene, trailingScene, typeScene, controlScene] =
  createOverlayScenes();

/**
 * Replay one overlay scene and keep its mismatches in the task metadata for diagnosis.
 * @param scene - Overlay scene from createOverlayScenes.
 * @param task - The running test, whose metadata receives the encoded mismatches.
 * @returns Every mismatch of the scene, in prefix order.
 */
async function replayOverlayScene(
  scene: RemountScene,
  task: TestContext['task'],
) {
  const mismatches = await checkCoreScene(scene, false);
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  return mismatches;
}

it('literal-star state owners match a fresh public-output mount', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createStarScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

// Only the VALUE-031 table rows remain; a difference in an outside observer (state visibility, readOnly, disabled, gate.leaf, watchValues)
// is not listed and fails.
it('projection overlays reach readers outside the overlay host: omitEmpty', async ({
  task,
}) => {
  expect(await replayOverlayScene(emptyScene, task)).toStrictEqual([
    {
      scene: 'gap-overlay-empty',
      seed: 443,
      prefix: 1,
      differences: createOmitEmptyDifferences('~1source~1data'),
    },
  ]);
}, 120000);

it('projection overlays reach readers outside the overlay host: omitTrailingEmpty', async ({
  task,
}) => {
  const mismatches = await replayOverlayScene(trailingScene, task);
  expect(
    mismatches.map(({ scene, prefix, differences }) => [
      scene,
      prefix,
      differences.map(({ path }) => path),
    ]),
  ).toStrictEqual([
    [
      'gap-overlay-trailing',
      1,
      overlayDifferencePaths['gap-overlay-trailing'].node,
    ],
  ]);
}, 120000);

// VALUE-031 table, union row: pins the current unconverted reading of a gate-narrowed union.
it('a gate-narrowed union keeps its unconverted value until a fresh load', async ({
  task,
}) => {
  expect(await replayOverlayScene(typeScene, task)).toStrictEqual([
    {
      scene: 'gap-overlay-type',
      seed: 443,
      prefix: 1,
      differences: overlayDifferencePaths['gap-overlay-type'].nodeDifferences,
    },
  ]);
}, 120000);

it('a same-host omitEmpty overlay differs only in the omitted source and value', async ({
  task,
}) => {
  expect(await replayOverlayScene(controlScene, task)).toStrictEqual([
    {
      scene: 'control-overlay-same-host',
      seed: 443,
      prefix: 1,
      differences: createOmitEmptyDifferences('~1cfg'),
    },
  ]);
}, 120000);

it('relocated gates observe value-only changes after first locate', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createRelocatedScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

it('the ancestor recheck lattice matches fresh mounts at every prefix', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createAncestorScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
