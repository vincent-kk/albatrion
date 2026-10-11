import { nullableScreenScenarios, playScenario } from '@aileron/schema-form-scenarios';
import { afterEach, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

// TEST-005: disposition's ten public nullable cases retain their observable values.
for (const scenario of nullableScreenScenarios) it(scenario.name, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
  await playScenario(scenario, form.container);
  expect(form.container.querySelector('[data-path]')).not.toBeNull();
  expect(form.caughtErrors()).toEqual([]);
});
