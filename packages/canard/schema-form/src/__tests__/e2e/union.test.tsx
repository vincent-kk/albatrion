import { unionScenarios, playScenario } from '@aileron/schema-form-scenarios';
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

describe('union — TEST-011 / TEST-023 shared screen runner', () => {
  it("LANDING-004 first screen exposes the explicitly active branch and defaults", async () => {
    await run("union.first-screen-active-defaults");
  });

  it("LANDING-032 branch round trips retain shared nodes and edited raw values", async () => {
    await run("union.branch-round-trip-shared-values");
  });

  it("LANDING-038 multiple active anyOf fragments merge shared fields", async () => {
    await run("union.active-anyof-shared-fields");
  });

  it("LANDING-018 nested branches preserve inner edits across outer activation", async () => {
    await run("union.nested-branch-round-trip");
  });

  it("LANDING-139 null ancestors do not fill branch defaults before input promotion", async () => {
    await run("union.null-ancestor-input-promotion");
  });

  it("LANDING-004 nullable-conditional-account", async () => {
    await run("union.nullable-conditional-account");
  });

  it("LANDING-207 typeless object branches render successfully", async () => {
    await run("union.typeless-object-branches");
  });

  it("LANDING-208 typeless literal properties render primitive leaves", async () => {
    await run("union.typeless-literal-properties");
  });
});
