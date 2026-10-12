import { describe, expect, it } from 'vitest';

import {
  type FormScenario,
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  valuesFeatureScenarios,
  valuesFindingScenarios,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/**
 * Execute one value feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param scenarios - The family list that owns the scenario.
 * @param name - Stable scenario name; its description cites the ledger.
 * @param inspect - Extra assertions on the settled screen, run after every step passed.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (scenarios: readonly FormScenario[], name: string, inspect?: (form: FormHarness) => void) => {
  const scenario = scenarios.find((item) => item.name === name);
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
    inspect?.(form);
  } finally {
    unregister();
    form.unmount();
  }
};

// it.fails passes on any throw, so a renamed or dropped open question must fail loudly here instead.
if (!valuesFindingScenarios.some((item) => item.name === 'values.finding-restricted-input-out-of-domain'))
  throw new Error('Missing finding scenario: values.finding-restricted-input-out-of-domain');

describe('features — values shared screen runner (TEST-025)', () => {
  it('LANDING-196 built-in inputs for the five primitive kinds reach node values and output', async () => {
    await run(valuesFeatureScenarios, 'values.primitive-inputs');
  });

  it('LANDING-208 enum, numeric enum, and typeless const keep their kind and report violations', async () => {
    await run(valuesFeatureScenarios, 'values.literal-and-format');
  });

  it('WRITE-090 fill sources apply only on load, reset, and resetSubtree, never on writes', async () => {
    await run(valuesFeatureScenarios, 'values.default-layers');
  });

  it('TEST-025 a recursive $ref tree keeps paths, verbs, and errors at every depth', async () => {
    await run(valuesFeatureScenarios, 'values.recursive-tree');
  });

  // Open question, not a ledger defect: the jsdom adapter does not compare select or date text with node values.
  it.fails('Open question: the enum select and the date input draw an out-of-domain value as a valid state', async () => {
    await run(valuesFindingScenarios, 'values.finding-restricted-input-out-of-domain', (form) => {
      expect(form.field('/size')?.value, 'select shows the node value').toBe(form.node('/size')?.value);
      expect(form.field('/released')?.value, 'date input shows the node value').toBe(form.node('/released')?.value);
    });
  });
});
