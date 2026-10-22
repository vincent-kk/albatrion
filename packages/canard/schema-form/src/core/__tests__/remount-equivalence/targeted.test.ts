import { beforeEach, expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';
import { encodeValue } from '@/schema-form/__tests__/fixtures/remountEquivalence/encodeValue';

import { checkCoreScene } from './helpers/checkCoreScene';

it('literal-star state owners match a fresh public-output mount', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createStarScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

it('projection overlays reach readers outside the overlay host', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createOverlayScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
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
