import { describe, expect, it } from 'vitest';

import {
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
  isolationTrigger,
  pluginsFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { type FormTypeInputProps, type JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Text input that throws while rendering on isolationTrigger; mapped to /broken for plugins.error-isolation.
 * @param props - FormTypeInput props of the mapped node.
 * @returns The input element; throws on the trigger value so the field boundary catches it.
 */
const ThrowOnTriggerInput = ({ path, value, onChange }: FormTypeInputProps<string>) => {
  if (value === isolationTrigger) throw new Error(`input at ${path} threw on ${isolationTrigger}`);
  return <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
};

/**
 * Execute one plugins feature scenario through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = pluginsFeatureScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, formTypeInputMap: { '/broken': ThrowOnTriggerInput } });
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

describe('features — plugins shared screen runner (TEST-025)', () => {
  it.each([
    'plugins.validator-sources',
    'plugins.renderer-replacement',
    'plugins.error-isolation',
  ])('%s runs its shared steps', async (name) => {
    await run(name);
  });
});
