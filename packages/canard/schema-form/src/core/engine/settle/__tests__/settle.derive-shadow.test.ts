import { afterEach, expect, it, vi } from 'vitest';

import { DeriveConvergenceTargets } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Restore the package setup's switch after each consumer-mode counterexample. */
const setupEnabled = engineModes.deriveShadow;

afterEach(() => {
  engineModes.setMode('deriveShadow', setupEnabled);
  vi.unstubAllEnvs();
});

it('does not run shadow with the internal flag off even when NODE_ENV is test', () => {
  engineModes.setMode('deriveShadow', false);
  vi.stubEnv('NODE_ENV', 'test');
  const { root, blueprint } = createTestTree({
    type: 'object',
    properties: {
      source: { type: 'number' },
      a: { type: 'number', controls: { derived: '../source + 1' } },
      b: { type: 'number', controls: { derived: '../a + 1' } },
    },
  });
  loadFieldNodeAtMount(root, { source: 1 }, WriteOption.Overwrite);
  DeriveConvergenceTargets.set(blueprint, new Set(['/a', '/b']));
  expect(() =>
    writeFieldNode(root.structure!.source, 3, 'input', WriteOption.Overwrite),
  ).not.toThrow();
});

it('defaults to off in a fresh module without package test setup', async () => {
  vi.resetModules();
  const fresh = await import('../../utils/cache/engineModes');
  expect(fresh.engineModes.deriveShadow).toBe(false);
});
