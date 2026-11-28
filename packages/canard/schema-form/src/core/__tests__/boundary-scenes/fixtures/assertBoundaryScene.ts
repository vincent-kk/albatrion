import { isDeepStrictEqual } from 'node:util';
import { expect } from 'vitest';

import { observeBoundaryScene } from './observeBoundaryScene';
import type { BoundaryScene, Observation } from './types';

/**
 * Run a scene and assert the readings its state demands: `expected` in every mode, or the exact `known` or
 * `pinned` readings of every mode. A `known` entry must differ from `expected` in some mode, so a removed
 * difference cannot stay recorded as known.
 * @param scene - The scene to check
 * @returns Resolves when checked; fails the running test on a mismatch
 */
export const assertBoundaryScene = async (
  scene: BoundaryScene,
): Promise<void> => {
  const observed = await observeBoundaryScene(scene);
  if (scene.state === 'open') {
    expect(observed).toStrictEqual(scene.pinned);
    return;
  }
  const readKeys = scene.modes.flatMap((mode) =>
    Object.keys(observed[mode] ?? {}),
  );
  expect(
    Object.keys(scene.expected).filter((key) => !readKeys.includes(key)),
    'every expected reading must be read by some mode',
  ).toStrictEqual([]);
  const expected = Object.fromEntries(
    scene.modes.map((mode) => [
      mode,
      pickKeys(scene.expected, observed[mode] ?? {}),
    ]),
  );
  if (scene.state === 'expected') {
    expect(observed).toStrictEqual(expected);
    return;
  }
  expect(observed).toStrictEqual(scene.known);
  expect(
    scene.modes.some(
      (mode) => !isDeepStrictEqual(scene.known[mode], expected[mode]),
    ),
    'a known entry must differ from the expected result',
  ).toBe(true);
};

/** Restrict the expected readings to the keys a mode reads; a fresh load reads only path probes. */
const pickKeys = (expected: Observation, read: Observation): Observation =>
  Object.fromEntries(Object.keys(read).map((key) => [key, expected[key]]));
