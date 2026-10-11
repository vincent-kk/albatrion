import { emptyDraftScenario, nonNullableEmptyDraftScenario, nullPromotionScenarios, playScenario, valueScenarios } from '@aileron/schema-form-scenarios';
import { afterEach, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

for (const scenario of valueScenarios) it(`TEST-023 ${scenario.name}`, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
  await playScenario(scenario, form.container);
  expect(form.container.querySelector('[data-path]')).not.toBeNull();
});

for (const scenario of nullPromotionScenarios) it(scenario.name, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
  expect(form.value('/first')).toBe(scenario.initialValue?.first ?? 'hidden');
  await playScenario(scenario, form.container);
  expect(form.value('/first')).toBe(form.node('/first')?.value ?? '');
});

it(emptyDraftScenario.name, async () => {
  form = await renderForm(emptyDraftScenario.schema as JSONSchema, { defaultValue: emptyDraftScenario.initialValue });
  await playScenario(emptyDraftScenario, form.container);
  expect(form.value('/text')).toBe('');
});

it(nonNullableEmptyDraftScenario.name, async () => {
  form = await renderForm(nonNullableEmptyDraftScenario.schema as JSONSchema, { defaultValue: nonNullableEmptyDraftScenario.initialValue });
  await playScenario(nonNullableEmptyDraftScenario, form.container);
  expect(form.value('/text')).toBe('');
});
