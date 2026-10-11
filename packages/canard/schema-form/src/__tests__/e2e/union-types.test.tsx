import { unionScenarios, findScenarioHandle, playScenario, registerScenarioHandle } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute the named shared data through the registered screen adapter.
 * @param name - Stable SCN scenario name; its description cites the ledger.
 * @returns Completion after every screen expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = unionScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const form = await renderForm(scenario.schema as JSONSchema, {
    defaultValue: scenario.initialValue, 
  });
  const { adapter } = findScenarioHandle(form.container);
  const unregister = registerScenarioHandle(form.container, form.handle, {
    ...adapter,
    async execute(step) {
      try {
        await adapter.execute(step);
      } catch (error) {
        if (step.expect?.diagnostics?.status !== 'degraded') throw error;
        expect(error).toMatchObject({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' });
      }
    },
  });
  try {
    await playScenario(scenario, form.container);
    for (const path of form.renderedPaths()) {
      const field = form.field(path);
      const value = form.node(path)?.value;
      if (field?.type === 'text' && typeof value === 'string')
        expect(field.value, `DOM value ${path}`).toBe(value);
    }
  } finally {
    unregister();
    form.unmount();
  }
};

describe('union-types — TEST-011 / TEST-023 shared screen runner', () => {
  it("WRITE-098 union.entry-two-step", async () => {
    await run("union.entry-two-step");
  });

  it("WRITE-093 union.gated-effective-list", async () => {
    await run("union.gated-effective-list");
  });

  it("WRITE-093 union.rule-a", async () => {
    await run("union.rule-a");
  });

  it("WRITE-093 union.ambiguous", async () => {
    await run("union.ambiguous");
  });

  it("WRITE-093 union.integer", async () => {
    await run("union.integer");
  });

  it("WRITE-093 union.object-array", async () => {
    await run("union.object-array");
  });

  it("WRITE-093 union.omit-empty", async () => {
    await run("union.omit-empty");
  });

  it("WRITE-093 union.default-fill", async () => {
    await run("union.default-fill");
  });

  it("WRITE-099 union.feedback-convergent", async () => {
    await run("union.feedback-convergent");
  });

  it("WRITE-099 union.feedback-nonconvergent", async () => {
    await run("union.feedback-nonconvergent");
  });
});
