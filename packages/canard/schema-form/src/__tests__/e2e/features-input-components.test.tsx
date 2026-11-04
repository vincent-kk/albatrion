import { describe, expect, it } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  inputComponentsFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one input-components feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = inputComponentsFeatureScenarios.find((item) => item.name === name);
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

describe('features — input-components shared screen runner (TEST-025)', () => {
  it.each([
    'input-components.input-resolution',
    'input-components.input-map',
    'input-components.trim-on-blur',
    'input-components.file-attach',
    'input-components.props-flow',
    'input-components.child-components',
  ])('%s runs its shared steps with the built-in inputs', async (name) => {
    await run(name);
  });
});
