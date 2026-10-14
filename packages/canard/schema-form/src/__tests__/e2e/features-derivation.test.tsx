import { describe, expect, it } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  derivationFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one derivation feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = derivationFeatureScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
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

describe('features — derivation shared screen runner (TEST-025)', () => {
  it('CONTROLS-021 and CONTROLS-022 visible hides and keeps output while active removes and restores the raw value', async () => {
    await run('derivation.visible-versus-active');
  });

  it('SETTLE-043 a watched path is a derived dependency and its edge overrides a manual edit', async () => {
    await run('derivation.watch-dependency');
  });

  it('CONTROLS-029 reset-interaction loads the name and its derived slug', async () => {
    await run('derivation.reset-interaction');
  });

  it('CONTROLS-080 context-reference loads its values without a context prop', async () => {
    await run('derivation.context-reference');
  });
});
