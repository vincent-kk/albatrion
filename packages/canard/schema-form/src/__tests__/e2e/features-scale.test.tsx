import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  deferredMountOptions,
  scaleFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { type JSONSchema, VirtualizationBackfill } from '@/schema-form';

import { renderForm } from '../renderForm';

// jsdom has no IntersectionObserver or idle callback; inert stubs leave every placeholder deferred until a command reveals it.
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestIdleCallback', () => 0);
  vi.stubGlobal('cancelIdleCallback', () => {});
});
afterEach(() => vi.unstubAllGlobals());

/** Virtualization options from the scenario data, with the backfill named by its enum member. */
const virtualization = { ...deferredMountOptions, backfill: VirtualizationBackfill.None };

/**
 * Execute one scale feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = scaleFeatureScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, virtualization });
  const base = findScenarioHandle(form.container).adapter;
  const unregister = registerScenarioHandle(form.container, form.handle, {
    execute: base.execute,
    settle: base.settle,
    async assert(observation) {
      const { errors, ...rest } = observation;
      await base.assert(rest);
      if (!errors) return;
      await form.validate();
      for (const [path, expected] of Object.entries(errors)) {
        const actual = form.node(path)?.errors;
        expect(actual, `validation issue count at ${path}`).toHaveLength(expected.length);
        expect(actual, `validation issue contract at ${path}`).toMatchObject(expected);
      }
    },
  });
  try {
    await playScenario(scenario, form.container);
  } finally {
    unregister();
    form.unmount();
  }
};

describe('features — scale shared screen runner (TEST-025)', () => {
  it.each([
    'scale.deferred-mount',
    'scale.large-array',
    'scale.expression-cost',
  ])('%s runs its shared steps under virtualization', async (name) => {
    await run(name);
  });

  it('TEST-020 a deferred field is built, read and focused before its placeholder is seen', async () => {
    const scenario = scaleFeatureScenarios.find((item) => item.name === 'scale.deferred-mount')!;
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, virtualization });
    try {
      expect({ deferred: form.deferred('/f39'), value: form.node('/f39')?.value, eager: form.deferred('/f0') }).toEqual({ deferred: true, value: 'v39', eager: false });
      await act(async () => form.handle.focus('/f39'));
      await form.flush();
      expect({ deferred: form.deferred('/f39'), focused: document.activeElement === form.field('/f39') }).toEqual({ deferred: false, focused: true });
    } finally {
      form.unmount();
    }
  });
});
