import { describe, expect, it } from 'vitest';

import {
  compositionFeatureScenarios,
  compositionFindingScenarios,
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
} from '@aileron/schema-form-scenarios';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one composition feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = [...compositionFeatureScenarios, ...compositionFindingScenarios].find((item) => item.name === name);
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

// it.fails passes on any throw, so a renamed or dropped finding must fail loudly here instead.
for (const name of ['composition.finding-batch-prunes-inactive-raw', 'composition.finding-batched-toggle-refills-default'])
  if (!compositionFindingScenarios.some((item) => item.name === name)) throw new Error(`Missing finding scenario: ${name}`);

describe('features — composition shared screen runner (TEST-025)', () => {
  it('FRAGMENT-006 explicit discriminator switches branches and reports an unmatched tag on the tag node', async () => {
    await run('composition.discriminator-tag-switch');
  });

  it('FRAGMENT-021 three nested oneOf levels keep raw values across inner and outer round trips', async () => {
    await run('composition.nested-oneof-three-levels');
  });

  it('LANDING-038 an anyOf inside a oneOf branch shares a field and survives the outer round trip', async () => {
    await run('composition.oneof-with-anyof-addons');
  });

  it('BLUEPRINT-004 allOf entries merge declarations, defaults, and required keys', async () => {
    await run('composition.allof-merged-required');
  });

  it('BLUEPRINT-004 allOf constraints on one node apply together, contradictory bounds included', async () => {
    await run('composition.allof-constraint-conjunction');
  });

  it('FRAGMENT-009 an if guard with then and else follows the validator verdict', async () => {
    await run('composition.if-then-else-guard');
  });

  it('FRAGMENT-021 allOf entries carry independent guards on a nested value', async () => {
    await run('composition.if-nested-guard');
  });

  it('FRAGMENT-009 four screen toggles and a single-write batch keep both sides', async () => {
    await run('composition.if-else-screen-rapid-toggle');
  });

  it('FRAGMENT-031 controls.active alone makes the validator reject the oneOf', async () => {
    await run('composition.oneof-active-without-const');
  });

  it('FRAGMENT-031 tag const and required make exactly one branch pass', async () => {
    await run('composition.oneof-active-with-const-required');
  });

  it('VALIDATE-043 inactive branch issues stay off nodes and the filter follows a switch', async () => {
    await run('composition.off-branch-error-filter');
  });

  it('FRAGMENT-009 a pattern guard reveals a dependent field and keeps its raw value', async () => {
    await run('composition.guard-pattern-reveal');
  });

  it.fails('Finding: a two-write batch on an unrelated field prunes a retained inactive raw value (LANDING-018)', async () => {
    await run('composition.finding-batch-prunes-inactive-raw');
  });

  it.fails('Finding: a batched triple toggle that reopens a hidden then branch refills its edited value (LANDING-011)', async () => {
    await run('composition.finding-batched-toggle-refills-default');
  });
});
