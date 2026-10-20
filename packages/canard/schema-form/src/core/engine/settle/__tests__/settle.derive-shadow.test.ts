import { afterEach, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';

/** Restore the package setup's switch after each consumer-mode counterexample. */
const setupEnabled = deriveShadowEvaluation.enabled;

afterEach(() => {
  deriveShadowEvaluation.enabled = setupEnabled;
  vi.unstubAllEnvs();
});

it('enables shadow verification through the package test setup', () => {
  expect(deriveShadowEvaluation.enabled).toBe(true);
});

it('does not run shadow with the internal flag off even when NODE_ENV is test', async () => {
  deriveShadowEvaluation.enabled = false;
  vi.stubEnv('NODE_ENV', 'test');
  vi.resetModules();
  const { DeriveConvergenceTargets: freshDeriveConvergenceTargets } =
    await import('@/schema-form/core/engine/blueprint');
  const { createTestTree: freshCreateTestTree } = await import(
    '../../__tests__/fixtures/createTestTree'
  );
  const { loadFieldNodeAtMount: freshLoadFieldNodeAtMount } = await import(
    '../loadFieldNodeAtMount'
  );
  const { deriveShadowEvaluation: freshDeriveShadowEvaluation } = await import(
    '../utils/derivation/deriveShadowEvaluation'
  );
  freshDeriveShadowEvaluation.enabled = false;
  const { writeFieldNode: freshWriteFieldNode } = await import(
    '../utils/write/writeFieldNode'
  );
  const { root, blueprint } = freshCreateTestTree({
    type: 'object',
    properties: {
      source: { type: 'number' },
      a: { type: 'number', controls: { derived: '../source + 1' } },
      b: { type: 'number', controls: { derived: '../a + 1' } },
    },
  });
  freshLoadFieldNodeAtMount(root, { source: 1 }, WriteOption.Overwrite);
  freshDeriveConvergenceTargets.set(blueprint, new Set(['/a', '/b']));
  expect(() =>
    freshWriteFieldNode(
      root.structure!.source,
      3,
      'input',
      WriteOption.Overwrite,
    ),
  ).not.toThrow();
});

it('defaults to off in a fresh module without package test setup', async () => {
  vi.resetModules();
  const fresh = await import('../utils/derivation/deriveShadowEvaluation');
  expect(fresh.deriveShadowEvaluation.enabled).toBe(false);
});
