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

// D443-02 — 결함, 수정 PR 대기; D443-04 — 원장 판정 대기; D443-05 — U7 후보, 소유자 판정 대기; C443-01·C443-02 — VALUE-031 ㄴ 후보, 소유자 판정 대기.
it.fails('projection overlays reach readers outside the overlay host', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createOverlayScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

// D443-03 — 결함, 수정 PR 대기.
it.fails('relocated gates observe value-only changes after first locate', async ({
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
