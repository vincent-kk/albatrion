import { controlsScenarios, playScenario } from '@aileron/schema-form-scenarios';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';
import type { FormHarness } from '../renderForm';

/**
 * Execute the named shared data through the registered screen adapter.
 * @param name - Stable SCN scenario name; its description cites the ledger.
 * @param onMount - Optional consumer instrumentation before shared screen steps.
 * @returns Completion after every screen expectation has been checked.
 */
const run = async (name: string, onMount?: (form: FormHarness) => void) => {
  const scenario = controlsScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const form = await renderForm(scenario.schema as JSONSchema, {
    defaultValue: scenario.initialValue, 
  });
  try {
    onMount?.(form);
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

describe('controls — TEST-011 / TEST-023 shared screen runner', () => {
  it("CONTROLS-082 controls.lock-or-visibility-and", async () => {
    await run("controls.lock-or-visibility-and");
  });

  it("CONTROLS-082 controls.standard-read-only", async () => {
    await run("controls.standard-read-only");
  });

  it("CONTROLS-073 controls.children-host-expression", async () => {
    await run("controls.children-host-expression");
  });

  it("CONTROLS-044 controls.fragment-scope", async () => {
    await run("controls.fragment-scope");
  });

  it("CONTROLS-044 controls.root-keys-do-not-inherit", async () => {
    await run("controls.root-keys-do-not-inherit");
  });

  it("CONTROLS-073 controls.children-value-layer", async () => {
    await run("controls.children-value-layer");
  });

  it("WRITE-031 controls.children-exit-policy-layer", async () => {
    await run("controls.children-exit-policy-layer");
  });

  it("WRITE-031 controls.fragment-exit-policy-layer", async () => {
    await run("controls.fragment-exit-policy-layer");
  });

  it("WRITE-031 controls.expression-exit-previous-commit", async () => {
    await run("controls.expression-exit-previous-commit");
  });

  it("CONTROLS-022 controls.visible-preserves-value", async () => {
    await run("controls.visible-preserves-value");
  });

  it("LANDING-196 empty default inputs write undefined despite omitEmpty false", async () => {
    const clearedInputs: { path: string; value: string }[] = [];
    await run("controls.empty-default-inputs", (form) => {
      for (const path of ['/name', '/count']) {
        const field = form.field(path);
        if (field) field.addEventListener('input', () => {
          clearedInputs.push({ path, value: field.value });
        });
      }
    });
    expect(clearedInputs).toEqual([
      { path: '/name', value: '' }, { path: '/count', value: '' },
    ]);
  });

  it("LANDING-167 virtual branches render children through whole writes and activation", async () => {
    await run("controls.virtual-branch-round-trip");
  });
});
