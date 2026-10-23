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

// 정당한 차이로 닫힌 핀(architecture/reviews/round-444-closing.md): C443-01(444C-01)·C443-02(444C-02)·D443-04(444C-03)·D443-05(444C-04).
// 정적 마스크를 더해 `it` 로 되돌리는 일은 9단계 시험 장치 항목이다.
it.fails('projection overlays reach readers outside the overlay host', async ({
  task,
}) => {
  const mismatches = [];
  for (const scene of createOverlayScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  Object.assign(task.meta, { remount: encodeValue(mismatches) });
  expect(mismatches).toEqual([]);
}, 120000);

// D443-03 — 결함, 수정 PR #451 의 소유자 수용(TEST-027) 대기.
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
