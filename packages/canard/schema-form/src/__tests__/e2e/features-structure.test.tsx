import { describe, expect, it } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  structureFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one structure feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = structureFeatureScenarios.find((item) => item.name === name);
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

describe('features — structure shared screen runner (TEST-025)', () => {
  it('SCHEMA-040 declared properties become nodes while undeclared keys stay emitted extras', async () => {
    await run('structure.object-properties-extras');
  });

  it('NODE-051 verbs on outer and inner arrays keep identity and move whole subtrees', async () => {
    await run('structure.nested-array-verbs');
  });

  it('VALIDATE-043 array keywords stay on the array host and item keywords on the item', async () => {
    await run('structure.array-constraint-errors');
  });

  it('EVENT-013 a batch of array verbs settles once as a whole write with positional identity (NODE-051)', async () => {
    await run('structure.batch-verbs-positional-identity');
  });
});
