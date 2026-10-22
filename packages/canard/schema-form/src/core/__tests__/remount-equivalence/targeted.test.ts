import { expect, it } from 'vitest';

import { createAncestorScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createAncestorScenes';
import { createOverlayScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createOverlayScenes';
import { createRelocatedScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createRelocatedScenes';
import { createStarScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createStarScenes';

import { checkCoreScene } from './helpers/checkCoreScene';

it('literal-star state owners match a fresh public-output mount', async () => {
  const mismatches = [];
  for (const scene of createStarScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  expect(mismatches).toEqual([]);
}, 120000);

it('projection overlays reach readers outside the overlay host', async () => {
  const mismatches = [];
  for (const scene of createOverlayScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  expect(mismatches).toEqual([]);
}, 120000);

it('relocated gates observe value-only changes after first locate', async () => {
  const mismatches = [];
  for (const scene of createRelocatedScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  expect(mismatches).toEqual([]);
}, 120000);

it('the ancestor recheck lattice matches fresh mounts at every prefix', async () => {
  const mismatches = [];
  for (const scene of createAncestorScenes())
    mismatches.push(...(await checkCoreScene(scene)));
  expect(mismatches).toEqual([]);
}, 120000);
