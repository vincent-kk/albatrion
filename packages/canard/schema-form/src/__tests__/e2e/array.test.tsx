import { arrayScenarios, findScenarioHandle, playScenario, registerScenarioHandle } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute the named shared data through the registered screen adapter.
 * @param name - Stable SCN scenario name; its description cites the ledger.
 * @returns Completion after every screen expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = arrayScenarios.find((item) => item.name === name);
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

describe('array — TEST-011 / TEST-023 shared screen runner', () => {
  it("NODE-051 array.push-slot", async () => {
    await run("array.push-slot");
  });

  it("NODE-051 array.pop-slot", async () => {
    await run("array.pop-slot");
  });

  it("NODE-051 array.remove-slot", async () => {
    await run("array.remove-slot");
  });

  it("NODE-051 array.clear-slots", async () => {
    await run("array.clear-slots");
  });

  it("NODE-051 array.update-slot", async () => {
    await run("array.update-slot");
  });

  it("NODE-051 array.whole-write", async () => {
    await run("array.whole-write");
  });

  it("NODE-052 array.items-prefix", async () => {
    await run("array.items-prefix");
  });

  it("NODE-053 array.terminal-verbs", async () => {
    await run("array.terminal-verbs");
  });

  it("VALUE-034 array.omit-trailing", async () => {
    await run("array.omit-trailing");
  });

  it("NODE-051 array.position-reconcile", async () => {
    await run("array.position-reconcile");
  });

  it("NODE-052 array.extras-tail", async () => {
    await run("array.extras-tail");
  });

  it("NODE-052 array.extra-becomes-node", async () => {
    await run("array.extra-becomes-node");
  });

  it("LANDING-202 array.landing-202", async () => {
    await run("array.landing-202");
  });

  it("VALUE-034 array.empty-output", async () => {
    await run("array.empty-output");
  });

  it("WRITE-099 array.source-b-structure", async () => {
    await run("array.source-b-structure");
  });
});
