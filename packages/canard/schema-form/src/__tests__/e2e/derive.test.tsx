import { deriveScenarios, playScenario } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute the named shared data through the registered screen adapter.
 * @param name - Stable SCN scenario name; its description cites the ledger.
 * @returns Completion after every screen expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = deriveScenarios.find((item) => item.name === name);
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

describe('derive — TEST-011 / TEST-023 shared screen runner', () => {
  it('LANDING-163 active dependencies do not retrigger an unchanged derived edge', async () => {
    await run('derive.active-dependency-preserves-derived-edit');
  });

  it("LANDING-014 derive.derived-edge-and-reset", async () => {
    await run("derive.derived-edge-and-reset");
  });

  it("CONTROLS-028 derive.unset-load-and-runtime-edge", async () => {
    await run("derive.unset-load-and-runtime-edge");
  });

  it("CONTROLS-026 derive.same-target-rank", async () => {
    await run("derive.same-target-rank");
  });

  it("CONTROLS-027 derive.inject-to-on-source-edge", async () => {
    await run("derive.inject-to-on-source-edge");
  });

  it("SETTLE-049 derive.reset-subtree-inject-scope", async () => {
    await run("derive.reset-subtree-inject-scope");
  });

  it("CONTROLS-079 derive.undefined-injection-stops", async () => {
    await run("derive.undefined-injection-stops");
  });

  it("LANDING-030 derive.feedback-budget", async () => {
    await run("derive.feedback-budget");
  });

  it("LANDING-014 dependency edges settle a derived chain and preserve manual edits", async () => {
    await run("derive.derived-chain-manual-edits");
  });

  it("LANDING-004 sibling injection chains activate an explicit branch", async () => {
    await run("derive.sibling-injection-branch");
  });

  it("LANDING-030 nested sources inject parent siblings and array items", async () => {
    await run("derive.parent-array-injection");
  });

  it("LANDING-166 input-triggered injection preserves a null ancestor while updating its child", async () => {
    await run("derive.injection-preserves-null-ancestor");
  });

  it("LANDING-139 derived values below null update the DOM without promoting the parent", async () => {
    await run("derive.derived-preserves-null-ancestor");
  });
});
