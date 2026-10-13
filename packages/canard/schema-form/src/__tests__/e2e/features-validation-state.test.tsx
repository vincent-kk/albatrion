import { describe, expect, it } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one validation-state feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = validationStateFeatureScenarios.find((item) => item.name === name);
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

describe('features — validation-state shared screen runner (TEST-025)', () => {
  it('VALIDATE-049 mode-timing input steps reach node values under the default mode', async () => {
    await run('validation-state.mode-timing');
  });

  it('LANDING-210 external-errors loads a valid form before any errors prop applies', async () => {
    await run('validation-state.external-errors');
  });

  it('VALIDATE-043 show-error holds a maxLength issue on the first screen', async () => {
    await run('validation-state.show-error');
  });

  it('REACT-026 format-error holds minLength and pattern issues in validator order', async () => {
    await run('validation-state.format-error');
  });

  it('VALUE-022 interaction-state loads a draft with values intact', async () => {
    await run('validation-state.interaction-state');
  });

  it('VALIDATE-006 submit-rejected holds a minLength issue on the first screen', async () => {
    await run('validation-state.submit-rejected');
  });

  it('VALIDATE-043 (2) required and item issues land on their own nodes and clear one by one', async () => {
    await run('validation-state.error-routing');
  });
});
