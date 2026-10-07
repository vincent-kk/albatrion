import { afterEach, expect, it, vi } from 'vitest';

import { DeriveConvergenceTargets } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { deriveShadowEvaluation } from '../utils/derivation/deriveShadowEvaluation';
import { createTestTree } from './fixtures/createTestTree';

/** Restore the package setup's switch after each consumer-mode counterexample. */
const setupEnabled = deriveShadowEvaluation.enabled;

afterEach(() => {
  deriveShadowEvaluation.enabled = setupEnabled;
  vi.unstubAllEnvs();
});

it('enables shadow verification through the package test setup', () => {
  expect(deriveShadowEvaluation.enabled).toBe(true);
});

it('does not run shadow with the internal flag off even when NODE_ENV is test', () => {
  deriveShadowEvaluation.enabled = false;
  vi.stubEnv('NODE_ENV', 'test');
  const { root, blueprint } = createTestTree({ type: 'object', properties: {
    source: { type: 'number' }, a: { type: 'number', controls: { derived: '../source + 1' } },
    b: { type: 'number', controls: { derived: '../a + 1' } },
  } });
  loadSchemaNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
  DeriveConvergenceTargets.set(blueprint, new Set(['/a', '/b']));
  expect(() => writeSchemaNode(root.structure!.source, 3, 'input', SetValueOption.Overwrite))
    .not.toThrow();
});

it('defaults to off in a fresh module without package test setup', async () => {
  vi.resetModules();
  const fresh = await import('../utils/derivation/deriveShadowEvaluation');
  expect(fresh.deriveShadowEvaluation.enabled).toBe(false);
});
