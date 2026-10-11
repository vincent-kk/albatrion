import { fillScenarios, nestedFillScenarios, playScenario } from '@aileron/schema-form-scenarios';
import { afterEach, expect, it } from 'vitest';

import type { FormTypeInputProps, JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

for (const scenario of fillScenarios) it(`TEST-023 ${scenario.name}`, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
  await playScenario(scenario, form.container);
  expect(form.value(scenario.name.includes('appearing') ? '/detail' : '/name')).toBe(scenario.name.includes('appearing') ? 'new' : 'filled');
});

for (const scenario of nestedFillScenarios) it(scenario.name, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
  await playScenario(scenario, form.container);
  expect(form.value('/profile/name')).toBe('external');
  expect(form.value('/rows/0/title')).toBe('row');
});

/** Terminal objects render their whole value, without drawing child proxies. */
const Terminal = ({ value }: FormTypeInputProps) => <output data-testid="terminal">{JSON.stringify(value)}</output>;

it('WRITE-071 caller defaultValue remains immutable without terminal child filling', async () => {
  const initial = { box: { given: 'caller' } };
  const before = structuredClone(initial);
  form = await renderForm({ type: 'object', properties: { box: { type: 'object', properties: { given: { type: 'string' }, added: { type: 'string', default: 'forbidden' } }, presentation: { FormTypeInput: Terminal } } } }, { defaultValue: initial });
  expect(form.getValue()).toEqual(before);
  expect(initial).toEqual(before);
  await form.reset();
  expect(initial).toEqual(before);
  expect(form.container.querySelector('output')?.textContent).toBe('{"given":"caller"}');
});

it('NODE-005 frozen terminal defaults render without child default filling', async () => {
  const initial = Object.freeze({ box: Object.freeze({ given: 'frozen' }) });
  form = await renderForm({ type: 'object', properties: { box: { type: 'object', properties: { given: { type: 'string' }, added: { type: 'string', default: 'forbidden' } }, presentation: { FormTypeInput: Terminal } } } }, { defaultValue: initial });
  expect(form.getValue()).toEqual({ box: { given: 'frozen' } });
  expect(form.container.querySelector('output')?.textContent).toBe('{"given":"frozen"}');
  expect(form.caughtErrors()).toEqual([]);
});
