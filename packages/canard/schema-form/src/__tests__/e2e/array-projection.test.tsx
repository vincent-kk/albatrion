import { arrayScenarios, playScenario } from '@aileron/schema-form-scenarios';
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
    defaultValue: scenario.initialValue, strictMode: true,
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
    form.unmount();
  }
};

describe('array-projection — TEST-011 / TEST-023 shared screen runner', () => {
  it('VALUE-034 nullable arrays preserve null and trim explicit slots through reset', async () => {
    await run('array.nullable-slots-reset');
  });

  it("VALUE-034 omitTrailing trims trailing holes and preserves leading null slots", async () => {
    await run("array.omit-trailing-leading-holes");
  });

  it("LANDING-023 branch arrays inject projected output and retain edited slots", async () => {
    await run("array.branch-projection-injection");
  });

  it("LANDING-116 minItems does not allocate inputs and explicit slots remain editable", async () => {
    await run("array.min-items-explicit-slots");
  });

  it("LANDING-149 prefixItems uses position schemas and reset restores external defaults", async () => {
    await run("array.prefix-items-external-reset");
  });

  it("LANDING-142 terminal object whole writes and reset preserve external values", async () => {
    await run("array.terminal-object-external-reset");
  });

  it("LANDING-149 terminal array ignores tuple fill and resets the whole value", async () => {
    await run("array.terminal-array-external-reset");
  });
});
